import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, of } from 'rxjs';

import { MapBrowserPointerEvent as OlMapBrowserPointerEvent } from 'ol/MapBrowserEvent';

import { Media, MediaService, MediaOrientation } from '@igo2/core';
import {
  ActionbarMode,
  Workspace,
  WorkspaceStore,
  EntityRecord,
  EntityStore,
  getEntityTitle
} from '@igo2/common';
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
  Layer,
  LayerOptions,
  LayerService
} from '@igo2/geo';
import {
  ContextState,
  ToolState,
  MapState,
  SearchState
} from '@igo2/integration';

import { SEARCH_TYPES } from 'src/app/modules/search/shared/search.enums';
import { ClientState } from 'src/app/modules/client/client.state';
import { ClientSearchSource } from 'src/app/modules/search/shared/sources/client';

import { CLIENT, Client } from 'src/lib/client';

import { CADASTRE } from 'src/lib/cadastre/shared/cadastre.enums';
import { DetailedContext } from '@igo2/context';

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

  private focusedSearchResult$$: Subscription;
  private currentSearchTerm: string;
  private currentSearchType: string = CLIENT;

  private searchAddedLayers: Map<string, Layer[]> = new Map();
  private searchVisibledLayers: Map<string, Layer[]> = new Map();
  private context$$: Subscription;

  get map(): IgoMap {
    return this.mapState.map;
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
    if (media === Media.Desktop && orientation === MediaOrientation.Landscape) {
      return ActionbarMode.Dock;
    }
    return ActionbarMode.Overlay;
  }

  get mapActionbarWithTitle(): boolean {
    return this.mapActionbarMode === ActionbarMode.Overlay;
  }

  get actionbarMode(): ActionbarMode {
    return this.expansionPanelExpanded ? ActionbarMode.Dock : ActionbarMode.Overlay;
  }

  get actionbarWithTitle(): boolean {
    return this.actionbarMode === ActionbarMode.Overlay;
  }

  get searchStore(): EntityStore<SearchResult> {
    return this.searchState.store;
  }

  get workspaceStore(): WorkspaceStore {
    return this.clientState.workspaceStore;
  }

  get workspace(): Workspace {
    return this.workspaceStore.activeWorkspace$.value;
  }

  get searchbarDisabled(): boolean { return this.currentSearchType === CADASTRE; }

  get toastPanelContent(): string {
    let content;
    if (this.workspace !== undefined && this.workspace.hasWidget) {
      content = 'workspace';
    } else if (this.searchResult !== undefined) {
      content = this.searchResult.meta.dataType.toLowerCase();
    }
    return content;
  }

  get toastPanelTitle(): string {
    let title;
    if (this.toastPanelContent !== 'workspace' && this.searchResult !== undefined) {
      title = getEntityTitle(this.searchResult);
    }
    return title;
  }

  get toastPanelOpened(): boolean {
    const content = this.toastPanelContent;
    if (content === 'workspace') {
      return true;
    }
    return this._toastPanelOpened;
  }
  set toastPanelOpened(value: boolean) {
    this._toastPanelOpened = value;
  }
  private _toastPanelOpened = false;

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
    this.focusedSearchResult$$ = this.searchStore.stateView
      .firstBy$((record: EntityRecord<SearchResult>) => record.state.focused === true)
      .subscribe((record: EntityRecord<SearchResult>) => {
        const result = record ? record.entity : undefined;
        this.onFocusSearchResult(result);
        this.updateSearchLayers(result);
      });

    this.context$$ = this.contextState.context$.subscribe((context: DetailedContext) => {
      if (context !== undefined) {
        this.updateSearchLayers(undefined);
      }
    });
  }

  ngOnDestroy() {
    this.context$$.unsubscribe();
    this.focusedSearchResult$$.unsubscribe();
  }

  onBackdropClick() {
    this.closeSidenav();
  }

  onToggleSidenavClick() {
    this.toggleSidenav();
  }

  onMapQuery(event: { features: Feature[]; event: OlMapBrowserPointerEvent }) {
    const querySearchSource = this.getQuerySearchSource();
    if (querySearchSource === undefined) { return; }

    const results = event.features.map((feature: Feature) => {
      // This patch removes the "square overlay. added after a query. IMO,
      // there should be an alternative to that square or no square at all.
      // Check the extractHtmlData of the QueryService for more info.
      feature.geometry = undefined;
      feature.extent = undefined;
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

  onSearchTermChange(term?: string) {
    this.currentSearchTerm = term;
    if (this.verifyNullTerm()) {
      this.onClearSearch();
      return;
    }
    this.onBeforeSearch();
  }

  onSearchTypeChange(type?: string) {
    this.currentSearchType = type;
    this.onBeforeSearch();
  }

  onSearch(event: {research: Research, results: SearchResult[]}) {
    const results = event.results;
    const querySearchSource = this.getQuerySearchSource();
    if (results.length === 0 && querySearchSource !== undefined && event.research.source === querySearchSource) {
      if (this.searchResult !== undefined && this.searchResult.source === querySearchSource) {
        this.searchStore.state.update(this.searchResult, {focused: false, selected: false});
        this.closeToastPanel();
      }
      return;
    }

    this.searchStore.state.updateAll({focused: false, selected: false});

    const newResults = this.searchStore.entities$.value
      .filter((result: SearchResult) => result.source !== event.research.source)
      .concat(results.filter((result: SearchResult) => result.meta.dataType !== CLIENT));
    this.searchStore.load(newResults);

    const clientResult = results.find((result: SearchResult) => result.meta.dataType === CLIENT);
    if (clientResult !== undefined) {
      this.onSearchClient(clientResult as SearchResult<Client>);
    } else if (event.research.source instanceof ClientSearchSource) {
      this.onClientNotFound();
    }

    const mapResults = results.filter((result: SearchResult) => result.source === querySearchSource);
    if (mapResults.length > 0) {
      this.onSearchMap(mapResults as SearchResult<Feature>[]);
    }
  }

  onDeactivateWorkspaceWidget() {
    this.closeToastPanel();
  }

  clearSearchResult() {
    this.closeToastPanel();
    this.map.overlay.clear();
    this.searchResult = undefined;
    this.searchStore.state.updateAll({focused: false, selected: false});
  }

  private closeToastPanel() {
    this.toastPanelOpened = false;
  }

  private openToastPanel() {
    this.toastPanelOpened = true;
  }

  private closeExpansionPanel() {
    this.expansionPanelExpanded = false;
  }

  private openExpansionPanel() {
    this.expansionPanelExpanded = true;
  }

  private closeSidenav() {
    this.sidenavOpened = false;
  }

  private openSidenav() {
    this.sidenavOpened = true;
  }

  private toggleSidenav() {
    this.sidenavOpened ? this.closeSidenav() : this.openSidenav();
  }

  private verifyNullTerm(): boolean {
    if (this.currentSearchTerm === undefined || this.currentSearchTerm === '') {
      return true;
    }
    return false;
  }

  private onBeforeSearch() {
    switch (this.currentSearchType) {
      case CLIENT: {
        this.onBeforeSearchClient();
        break;
      }
      case CADASTRE: {
        this.onBeforeSearchCadastre();
        break;
      }
      default: {
        this.onBeforeSearchOthers();
        break;
      }
    }
  }

  private onBeforeSearchOthers() {
    if (this.verifyNullTerm()) { return; }

    if (this.mediaService.media$.value === Media.Mobile) {
      this.closeToastPanel();
    }
    this.toolState.toolbox.activateTool('searchResults');
    this.openSidenav();
  }

  private onBeforeSearchClient() {
    if (this.verifyNullTerm()) { return; }

    if (this.mediaService.media$.value === Media.Mobile) {
      this.closeExpansionPanel();
    } else {
      this.openExpansionPanel();
    }

    if (this.currentSearchTerm.length >= 3) {
      this.toolState.toolbox.activateTool('client');
      this.openSidenav();
    }
  }

  private onBeforeSearchCadastre() {
    if (this.mediaService.media$.value === Media.Mobile) {
      this.closeExpansionPanel();
    } else {
      this.openExpansionPanel();
    }

    this.toolState.toolbox.activateTool('cadastre');
    this.openSidenav();
  }

  private onSearchClient(result: SearchResult<Client>) {
    this.closeToastPanel();
    this.clientState.addClient(result.data);
  }

  private onClientNotFound() {
    this.clientState.setClientNotFound(true);
  }

  private onSearchMap(results: SearchResult<Feature>[]) {
    if (results.length === 0) { return; }
    if (this.mediaService.media$.value === Media.Mobile) {
      this.closeToastPanel();
    }
    this.toolState.toolbox.activateTool('searchResults');
    this.openSidenav();
    this.searchStore.state.update(results[0], {selected: true}, true);
  }

  private onFocusSearchResult(result: SearchResult) {
    if (result === undefined) {
      this.closeToastPanel();
      this.searchResult = undefined;
      return;
    }

    if (result.meta.dataType === FEATURE) {
      if (this.mediaService.media$.value === Media.Mobile) {
        this.closeSidenav();
      }

      this.searchResult = result;
      // open the toast panel only if the focus comes from the map
      const querySearchSource = this.getQuerySearchSource();
      if (querySearchSource !== undefined && result.source === querySearchSource) {
        this.openToastPanel();
      }
    } else {
      this.searchResult = undefined;
    }
  }

  private onClearSearch() {
    this.searchStore.clear();
    this.map.overlay.clear();
    this.closeToastPanel();
    this.clientState.setClientNotFound(false);
    // this.clientState.clearAllClients();
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
    this.clearOtherSearchLayers(result);
  }

  /**
   * Adds search layer
   * @param layer Layer to be added
   * @param searchType The search type
   */
  private addSearchLayer(layer: Layer, searchType: string) {
    if (this.searchAddedLayers.has(searchType)) {
      this.searchAddedLayers.get(searchType).push(layer);
    } else {
      this.searchAddedLayers.set(searchType, [layer]);
    }
    this.map.addLayer(layer);
  }

  private makeSearchLayerVisible(layerAlias: string, searchType: string) {
    const layer = this.map.getLayerByAlias(layerAlias);
    if (layer === undefined) { return; }

    if (this.searchVisibledLayers.has(searchType)) {
      this.searchVisibledLayers.get(searchType).push(layer);
    } else {
      this.searchVisibledLayers.set(searchType, [layer]);
    }
    layer.visible = true;
  }

  /**
   * Clears all search layers
   */
  private clearAllSearchLayers() {
    this.searchAddedLayers.forEach((layers: Layer[]) => {
      this.map.removeLayers(layers);
    });

    this.searchVisibledLayers.forEach((layers: Layer[]) => {
      layers.forEach((layer: Layer) => {
        layer.visible = false;
      });
    });
  }

  /**
   * Clears others search layers there are not the current SearchResult layers.
   * @param result The SearchResult
   */
  private clearOtherSearchLayers(result: SearchResult) {
    const  searchType = (result.source.constructor as typeof SearchSource).type;

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
}
