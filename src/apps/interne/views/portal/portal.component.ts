import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, Subscription, of, combineLatest } from 'rxjs';

import OlMapBrowserEvent from 'ol/MapBrowserEvent';

import { Media, MediaService, MediaOrientation } from '@igo2/core/media';
import { ActionbarMode } from '@igo2/common/action';
import { EntityRecord, EntityStore } from '@igo2/common/entity';
import { Tool } from '@igo2/common/tool';
import { Widget } from '@igo2/common/widget';
import { Workspace, WorkspaceStore } from '@igo2/common/workspace';
import {
  FEATURE,
  Feature,
  featureToSearchResult,
  IgoMap,
  QuerySearchSource,
  Research,
  SearchResult,
  SearchSource,
  SearchSourceService,
  SearchBarComponent,
  Layer,
  LayerOptions,
  LayerService,
} from '@igo2/geo';
import {
  ContextState,
  ToolState,
  MapState,
  SearchState
} from '@igo2/integration';

import { SEARCH_TYPES } from 'src/apps/interne/modules/search/shared/search.enums';
import { ClientState } from 'src/apps/interne/modules/client/client.state';
import { ClientSearchSource } from 'src/apps/interne/modules/search/shared/sources/client';

import { CLIENT, Client, validateClientNum } from 'src/lib/client';

import { CADASTRE } from 'src/lib/cadastre/shared/cadastre.enums';
import { getOlViewResolutions } from 'src/lib/map';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss']
})
export class PortalComponent implements OnInit, OnDestroy {

  public searchResult: SearchResult;
  public searchTypes = SEARCH_TYPES;
  public minSearchTermLength = 2;

  public expansionPanelExpanded = false;
  public sidenavOpened = false;
  public toastPanelOpened = false;
  public showToastPanelToggle = false;
  public contextualMenuLocation$ = new BehaviorSubject<{x: number, y: number}>(null);

  private focusedSearchResult$$: Subscription;

  private searchAddedLayers: Map<string, Layer[]> = new Map();
  private searchVisibledLayers: Map<string, Layer[]> = new Map();
  private context$$: Subscription;

  private searchDisabled$$: Subscription;

  private activeTool$$: Subscription;
  private activeWidget$$: Subscription;

  private mapReady$ = new BehaviorSubject<IgoMap | null>(null);
  private lastFocusedResult: SearchResult | undefined;


  get map(): IgoMap | null {
    return this.mapState.map ?? null;
  }

  get backdropShown(): boolean {
    return this.mediaService.media$.value === Media.Mobile && this.sidenavOpened;
  }

  get expansionPanelBackdropShown(): boolean {
    return this.expansionPanelExpanded && this.toastPanelOpened;
  }

  get mapActionbarMode(): ActionbarMode {
    const media = this.mediaService.media$.value;
    const orientation = this.mediaService.orientation$.value;
    if (
      media === Media.Desktop && orientation === MediaOrientation.Portrait ||
      media === Media.Tablet ||
      media === Media.Mobile
    ) {
      return ActionbarMode.Overlay;
    }
    return ActionbarMode.Dock;
  }

  get mapActionbarWithTitle(): boolean {
    return this.mapActionbarMode === ActionbarMode.Overlay;
  }

  get actionbarMode(): ActionbarMode {
    return this.mapActionbarMode;
  }

  get actionbarWithTitle(): boolean {
    return this.actionbarMode === ActionbarMode.Overlay;
  }

  get searchStore(): EntityStore<SearchResult> {
    return this.searchState.store;
  }

  get workspaces(): WorkspaceStore {
    return this.clientState.workspaces;
  }

  get workspace$(): BehaviorSubject<Workspace> {
    return this.clientState.activeWorkspace$;
  }

  get searchTerm(): string { return this.searchState.searchTerm$.value; }

  get searchType(): string { return this.searchState.searchType$.value; }

  @ViewChild('mapBrowser', { read: ElementRef, static: true })
  mapBrowserEl: ElementRef;

  @ViewChild(SearchBarComponent) search: SearchBarComponent;

  constructor(
    private mapState: MapState,
    private clientState: ClientState,
    private contextState: ContextState,
    private searchState: SearchState,
    private toolState: ToolState,
    private mediaService: MediaService,
    private searchSourceService: SearchSourceService,
    private layerService: LayerService,
  ) {}

  ngOnInit() {

    this.searchState.setSearchType(CLIENT);

    /**
     * ✅ 1. ATTEND QUE LA MAP SOIT PRÊTE (CRITIQUE)
     */
    const waitMapReady = setInterval(() => {
      const map = this.mapState.map;

      // ✅ NOUVELLE CONDITION ROBUSTE
      if (map && map.viewController && map.viewController.getOlMap()) {

        // console.log('✅ MAP READY (OL OK)');

        this.mapReady$.next(map);
        clearInterval(waitMapReady);

        this.updateViewResolutions();
        this.updateSearchLayers(undefined);

        // ✅ 🔥 REPLAY
        if (this.lastFocusedResult) {
          // console.log('🔁 REPLAY LAST RESULT', this.lastFocusedResult);

          this.onFocusSearchResult(this.lastFocusedResult);
          this.updateSearchLayers(this.lastFocusedResult);
        }
      }
    }, 100);

    /**
     * ✅ 2. RÉACTION AUX RÉSULTATS (runtime)
     */
    this.focusedSearchResult$$ = this.searchStore.stateView
    .firstBy$((record: EntityRecord<SearchResult>) => record.state.focused === true)
    .subscribe((record) => {

      if (!record) {
            // console.log('⚠️ NO FOCUSED RECORD');
            return;
          }

          const result = record.entity;

          this.lastFocusedResult = result;

          const map = this.getMap();
          if (!map) {
            // console.log('⛔ MAP NOT READY (focus)');
            return;
          }

          // console.log('🎯 FOCUS RESULT', result);

          this.onFocusSearchResult(result);
          this.updateSearchLayers(result);
    });

    /**
     * ✅ 3. CONTEXTE (optionnel mais utile)
     */
    this.context$$ = this.contextState.context$.subscribe((context) => {

      // console.log('📦 CONTEXT CHANGED', context);
      const map = this.getMap();
      if (!map || !context) return;

      const contextLayers = context.layers || [];

      contextLayers.forEach((layerOptions: any) => {
        const existing = map.layers.find(l => l.id === layerOptions.id);
          if (existing) {
            // console.log('♻️ LAYER ALREADY EXISTS', layerOptions.id);
            return;
          }

        this.layerService.createAsyncLayer(layerOptions)
          .subscribe(layer => {
            // ✅ évite duplication
            const existing = map.layers.find(l => l.id === layerOptions.id);
            if (existing) return;
            // console.log('✅ ADD LAYER (IGO)', layerOptions.id);
            map.addLayer(layer);
          });
      });

      this.updateViewResolutions();
    });

    /**
     * ✅ 4. WIDGET UI
     */
    this.activeWidget$$ = this.clientState.activeWidget$.subscribe((widget: Widget) => {
      if (widget !== undefined) {
        this.openToastPanel();
        this.showToastPanelToggle = true;
      } else {
        this.closeToastPanel();
        this.showToastPanelToggle = false;
      }
    });

    /**
     * ✅ 5. TOOL ACTIVE
     */
    this.activeTool$$ = this.toolState.toolbox.activeTool$.subscribe((tool: Tool) => {
      if (tool && tool.name === 'directions') {
        this.searchState.setSearchType(FEATURE);
      }
    });

    /**
     * ✅ 6. SEARCH ENABLE / DISABLE
     */
    this.searchDisabled$$ = combineLatest([
      this.clientState.activeWidget$,
      this.searchState.searchType$
    ]).subscribe(([widget, searchType]: [Widget, string]) => {

      const disabled = widget !== undefined || searchType === CADASTRE;

      if (disabled) {
        this.searchState.disableSearch();
      } else {
        this.searchState.enableSearch();
      }
    });
  }

  ngOnDestroy() {
    this.context$$.unsubscribe();
    this.focusedSearchResult$$.unsubscribe();
    this.activeTool$$.unsubscribe();
    this.activeWidget$$.unsubscribe();
    this.searchDisabled$$.unsubscribe();
  }

  onBackdropClick() {
    this.closeSidenav();
  }

  onToggleSidenavClick() {
    this.toggleSidenav();
  }

  onMapQuery(event: { features: Feature[]; event: OlMapBrowserEvent<any> }) {
    const querySearchSource = this.getQuerySearchSource();
    if (querySearchSource === undefined) { return; }

    const results = event.features.map((feature: Feature) => {
      // This patch removes the "square overlay. added after a query. IMO,
      // there should be an alternative to that square or no square at all.
      // Check the extractHtmlData of the QueryService for more info.
      // feature.geometry = undefined;
      // feature.extent = undefined;
      return featureToSearchResult(feature, querySearchSource);
    });
    const research = {
      request: of(results),
      reverse: false,
      source: querySearchSource
    };
    research.request.subscribe((_results: SearchResult<Feature>[]) => {
      this.onSearch({ research, results: _results });
    });
  }

  onSearchTermChange(searchTerm?: string) {
    if (this.verifyNullTerm(searchTerm)) {
      this.onClearSearch();
      return;
    }
    this.onBeforeSearch(this.searchType, searchTerm);
  }

  onSearchTypeChange(searchType?: string) {
    this.onBeforeSearch(searchType, this.searchTerm);
  }

  onSearch(event: {research: Research, results: SearchResult[]}) {
    const results = event.results;
    const searchSource = event.research.source;
    const querySearchSource = this.getQuerySearchSource();
    if (results.length === 0 && querySearchSource !== undefined && searchSource === querySearchSource) {
      if (this.searchResult !== undefined && this.searchResult.source === querySearchSource) {
        this.searchStore.state.update(this.searchResult, {focused: false, selected: false});
      }
      return;
    }

    if (!(searchSource instanceof ClientSearchSource)) {
      this.searchStore.state.updateAll({focused: false, selected: false});
    }

    const newResults = this.searchStore.all()
      .filter((result: SearchResult) => result.source !== searchSource)
      .concat(results.filter((result: SearchResult) => result.meta.dataType !== CLIENT));
    this.searchStore.load(newResults);

    const clientResult = results.find((result: SearchResult) => result.meta.dataType === CLIENT);
    if (clientResult !== undefined) {
      this.onSearchClient(clientResult as SearchResult<Client>);
    } else if (searchSource instanceof ClientSearchSource) {
      this.onClientNotFound();
    }

    const mapResults = results.filter((result: SearchResult) => result.source === querySearchSource);
    if (mapResults.length > 0) {
      this.onSearchMap(mapResults as SearchResult<Feature>[]);
    }
  }

  onContextualMenuOpen(event: { x: number; y: number }) {
    this.contextualMenuLocation$.next(event);
  }

  onDeactivateWorkspaceWidget() {
    this.closeToastPanel();
  }

  clearSearchResult() {
    const map = this.getMap();
    if (map?.overlay) {
      map.overlay.clear();
    }

    this.searchResult = undefined;
    this.searchStore.state.updateAll({ focused: false, selected: false });
  }


  closeToastPanel() {
    this.toastPanelOpened = false;
  }

  openToastPanel() {
    this.toastPanelOpened = true;
  }

  closeExpansionPanel() {
    this.expansionPanelExpanded = false;
  }

  openExpansionPanel() {
    this.expansionPanelExpanded = true;
  }

  closeSidenav() {
    this.sidenavOpened = false;
  }

  openSidenav() {
    this.sidenavOpened = true;
  }

  toggleSidenav() {
    this.sidenavOpened ? this.closeSidenav() : this.openSidenav();
  }

  private verifyNullTerm(searchTerm: string): boolean {
    if (searchTerm === undefined || searchTerm === '') {
      return true;
    }
    return false;
  }

  private onBeforeSearch(searchType?: string, searchTerm?: string) {
    switch (searchType) {
      case CLIENT: {
        this.onBeforeSearchClient(searchTerm);
        break;
      }
      case CADASTRE: {
        this.onBeforeSearchCadastre();
        break;
      }
      default: {
        this.onBeforeSearchOthers(searchTerm);
        break;
      }
    }
  }

  private onBeforeSearchOthers(searchTerm: string) {
    if (this.verifyNullTerm(searchTerm)) { return; }
    this.toolState.toolbox.activateTool('searchResults');
    this.openSidenav();
  }

  private onBeforeSearchClient(searchTerm: string) {
    searchTerm = searchTerm ? searchTerm.trim() : undefined;

    if (this.verifyNullTerm(searchTerm)) { return; }

    const searchTermIsValid = validateClientNum(searchTerm);

    if (this.mediaService.media$.value === Media.Mobile) {
      this.closeExpansionPanel();
    } else if (searchTermIsValid) {
      setTimeout(() => {
        this.openExpansionPanel();
      }, 400);
    }

    this.toolState.toolbox.activateTool('client');
    this.openSidenav();
  }

  private onBeforeSearchCadastre() {
    this.toolState.toolbox.activateTool('cadastre');
    this.openSidenav();
  }

  private onSearchClient(result: SearchResult<Client>) {
    this.clientState.setClientNotFound(false);
    this.clientState.addClient(result.data);
  }

  private onClientNotFound() {
    this.clientState.setClientNotFound(true);
  }

  private onSearchMap(results: SearchResult<Feature>[]) {
    if (results.length === 0) { return; }
    this.searchStore.state.update(results[0], {selected: true, focused: true}, true);
  }

  private onFocusSearchResult(result: SearchResult) {
    if (result === undefined) {
      this.searchResult = undefined;
      return;
    }

    this.toolState.toolbox.activateTool('searchResults');
    if (result.meta.dataType === FEATURE) {
      this.searchResult = result;
      if (this.mediaService.media$.value === Media.Mobile) {
        this.closeSidenav();
      } else {
        this.openSidenav();
      }
    } else {
      this.searchResult = undefined;
    }
  }

  private onClearSearch() {
    const map = this.getMap();
    if (map?.overlay) {
      map.overlay.clear();
    }

    this.searchStore.clear();
    this.clientState.setClientNotFound(false);
  }

  private getQuerySearchSource(): SearchSource {
    return this.searchSourceService
      .getSources()
      .find((searchSource: SearchSource) => searchSource instanceof QuerySearchSource);
  }

  /**
   * Updates search layers
   * @param result Result search to update layers
   */
  private updateSearchLayers(result: SearchResult) {
    const map = this.mapState.map;

    // ✅ PROTECTION CRITIQUE
    if (!map || !(map as any).layerController) return;

    if (result === undefined) {
      this.clearAllSearchLayers();
      return;
    }

    if (this.contextState.context$.value === undefined) { return; }

    const searchLayers = (this.contextState.context$.value as any).searchLayers || {};
    const searchType = (result.source.constructor as typeof SearchSource).type;
    const layers = searchLayers[searchType] || [];

    layers.forEach((layerInfo: string | LayerOptions | Layer) => {
      if (layerInfo instanceof Layer) {
        this.addSearchLayer(layerInfo, searchType);
      } else if (typeof layerInfo === 'string') {
        this.makeSearchLayerVisible(layerInfo, searchType);
      } else {
        this.layerService
          .createAsyncLayer(layerInfo)
          .subscribe(layer => this.addSearchLayer(layer, searchType));
      }
    });

    this.clearOtherSearchLayers(result); // ✅ CONSERVÉ
  }

  /**
   * Adds search layer
   * @param layer Layer to be added
   * @param searchType The search type
   */
  private addSearchLayer(layer: Layer, searchType: string) {
    const map = this.getMap();
    if (!map) return;

    if (this.searchAddedLayers.has(searchType)) {
      this.searchAddedLayers.get(searchType).push(layer);
    } else {
      this.searchAddedLayers.set(searchType, [layer]);
    }

    map.addLayer(layer);
  }


  private makeSearchLayerVisible(layerAlias: string, searchType: string) {
    const map = this.getMap();
    if (!map) return;

    const layer = (map as any).getLayerByAlias(layerAlias);
    if (layer === undefined) { return; }

    if (this.searchVisibledLayers.has(searchType)) {
      this.searchVisibledLayers.get(searchType)?.push(layer);
    } else {
      this.searchVisibledLayers.set(searchType, [layer]);
    }

    layer.visible = true;
  }

  /**
   * Clears all search layers
   */
  private clearAllSearchLayers() {
    const map = this.getMap();
    if (!map) return;

    this.searchAddedLayers.forEach((layers: Layer[]) => {
      layers.forEach((layer: Layer) => {
        map.removeLayer(layer);
      });
    });

    this.searchVisibledLayers.forEach((layers: Layer[]) => {
      layers.forEach((layer: Layer) => {
        layer.visible = false;
      });
    });

    this.searchAddedLayers.clear();
    this.searchVisibledLayers.clear();
  }

  /**
   * Clears others search layers there are not the current SearchResult layers.
   * @param result The SearchResult
   */
  private clearOtherSearchLayers(result: SearchResult) {
    const searchType = (result.source.constructor as typeof SearchSource).type;

    this.searchAddedLayers.forEach((layers: Layer[], key: string) => {
      if (key !== searchType) {
        layers.forEach((layer: Layer) => {
          layer.visible = false;
        });
      }
    });

    this.searchVisibledLayers.forEach((layers: Layer[], key: string) => {
      if (key !== searchType) {
        layers.forEach((layer: Layer) => {
          layer.visible = false;
        });
      }
    });
  }

  /**
   * Update the view resolutions to constrain the zoom levels between 0 and
   * the max zoom value found in the context.
   * @param result The SearchResult
   */
  private updateViewResolutions(): void {
    const map = this.getMap();
    if (!map) return;

    const context = this.contextState.context$.value;
    if (!context) return;

    const viewController = map.viewController;
    const olMap = viewController.getOlMap();
    const olView = olMap.getView();

    const mapContext = context.map;
    const viewContext = mapContext ? (mapContext.view || {}) : {};
    const maxZoom = viewContext.maxZoom || olView.getMaxZoom();

    const resolutions = getOlViewResolutions(olView);

    map.updateView({
      resolutions: resolutions.slice(0, maxZoom)
    });
  }

  private getMap(): IgoMap | null {
    const map = this.mapReady$.value;

    if (!map) {
      return null;
    }

    // ✅ même condition que ton setInterval
    if (!map.viewController || !map.viewController.getOlMap()) {
      return null;
    }

    return map;
  }

}
