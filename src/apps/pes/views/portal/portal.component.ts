import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription, of } from 'rxjs';

import { MapBrowserPointerEvent as OlMapBrowserPointerEvent } from 'ol/MapBrowserEvent';

import { Media, MediaService, MediaOrientation } from '@igo2/core';
import { DetailedContext } from '@igo2/context';
import {
  ActionbarMode,
  EntityRecord,
  EntityStore
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
  SearchBarComponent,
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

import { SEARCH_TYPES } from 'src/apps/pes/modules/search/shared/search.enums';
import { ClientState } from 'src/apps/pes/modules/client/client.state';
import { ClientController } from 'src/apps/pes/modules/client/shared/client-controller';

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
  public showToastPanelToggle = false;

  private focusedSearchResult$$: Subscription;

  private searchAddedLayers: Map<string, Layer[]> = new Map();
  private searchVisibledLayers: Map<string, Layer[]> = new Map();
  private context$$: Subscription;

  readonly actionbarMode: ActionbarMode = ActionbarMode.Dock;

  get map(): IgoMap {
    return this.mapState.map;
  }

  get backdropShown(): boolean {
    return this.mediaService.media$.value === Media.Mobile && this.sidenavOpened;
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

  get searchStore(): EntityStore<SearchResult> {
    return this.searchState.store;
  }

  get controller$(): BehaviorSubject<ClientController> {
    return this.clientState.controller$;
  }

  get searchTerm(): string { return this.searchState.searchTerm$.value; }

  get searchType(): string { return this.searchState.searchType$.value; }

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
    this.searchState.setSearchType(FEATURE);

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
    const querySearchSource = this.getQuerySearchSource();
    if (results.length === 0 && querySearchSource !== undefined && event.research.source === querySearchSource) {
      if (this.searchResult !== undefined && this.searchResult.source === querySearchSource) {
        this.searchStore.state.update(this.searchResult, {focused: false, selected: false});
      }
      return;
    }

    this.searchStore.state.updateAll({focused: false, selected: false});

    const newResults = this.searchStore.all()
      .filter((result: SearchResult) => result.source !== event.research.source)
      .concat(results);
    this.searchStore.load(newResults);

    const mapResults = results.filter((result: SearchResult) => result.source === querySearchSource);
    if (mapResults.length > 0) {
      this.onSearchMap(mapResults as SearchResult<Feature>[]);
    }
  }

  clearSearchResult() {
    this.map.overlay.clear();
    this.searchResult = undefined;
    this.searchStore.state.updateAll({focused: false, selected: false});
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
    this.onBeforeSearchOthers(searchTerm);
  }

  private onBeforeSearchOthers(searchTerm: string) {
    if (this.verifyNullTerm(searchTerm)) { return; }
    this.toolState.toolbox.activateTool('searchResults');
    this.openSidenav();
  }

  private onSearchMap(results: SearchResult<Feature>[]) {
    if (results.length === 0) { return; }
    this.toolState.toolbox.activateTool('searchResults');
    this.openSidenav();
    this.searchStore.state.update(results[0], {selected: true}, true);
  }

  private onFocusSearchResult(result: SearchResult) {
    if (result === undefined) {
      this.searchResult = undefined;
      return;
    }

    if (result.meta.dataType === FEATURE) {
      if (this.mediaService.media$.value === Media.Mobile) {
        this.closeSidenav();
      }
      this.searchResult = result;
    } else {
      this.searchResult = undefined;
    }
  }

  private onClearSearch() {
    this.searchStore.clear();
    this.map.overlay.clear();
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
