import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EntityRecord } from '@igo2/common';
import { FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  FeatureDataSource,
  VectorLayer,
  IgoMap,
  Layer,
  LayerService,
  LayerOptions
 } from '@igo2/geo';
import { Address } from '../shared/address.interface';

/**
 * Tool to edit addresses from Adresse Quebec.
 */
@Component({
  selector: 'fadq-address-editor',
  templateUrl: './address-editor.component.html',
  styleUrls: ['./address-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressEditorComponent implements OnInit, OnDestroy {

  selectedAddress$: BehaviorSubject<Address> = new BehaviorSubject<Address>(undefined);

  private selectedAddress$$: Subscription;

  /**
   * The map to measure on
   */
  @Input() map: IgoMap;

  /**
   * The store
   */
  @Input() store: FeatureStore<Address>;

  @Input() layerIdBuildings: string;
  @Input() layerIdBuildingsCorrected: string;
  @Input() layerOptions: LayerOptions[];

  inEdition: boolean;

  disabled: boolean = false;

  constructor(private layerService: LayerService) {}

  /**
   * Add draw controls and activate one
   * @internal
   */
  ngOnInit() {
    this.initStore();
  }
   /**
   * Toggle the clear buildingNumber and suffix
   * @internal
   */
  ngOnDestroy() {
    this.selectedAddress$$.unsubscribe();
  }

  handleFormEdit(isClick: boolean) {
    // this.submitted = true;
    if (isClick) {
      this.inEdition = true;
      this.initEdition();
    }    else {
      this.inEdition = false;
    }
  }
  handleFormSave(isClick: boolean) {
    // this.submitted = true;
    if (isClick) {
      this.inEdition = true;
    }    else {
      this.inEdition = false;
    }
  }
  handleFormCancel(isClick: boolean) {
    // this.submitted = true;
    if (isClick) {
      this.inEdition = true;
    }    else {
      this.inEdition = false;
    }
  }

  /**
   * Initialize the measure store and set up some listeners
   * @internal
   */
  private initStore() {
    const store = this.store;

    if (store.layer === undefined) {
      const layer = new VectorLayer({
        zIndex: 200,
        source: new FeatureDataSource()
      });
      layer.options.showInLayerList = false;
      store.bindLayer(layer);
    }

    if (store.layer.map === undefined) {
      this.map.addLayer(store.layer);
    }

    if (store.getStrategyOfType(FeatureStoreLoadingStrategy) === undefined) {
      store.addStrategy(new FeatureStoreLoadingStrategy({}));
    }
    store.activateStrategyOfType(FeatureStoreLoadingStrategy);

    if (store.getStrategyOfType(FeatureStoreSelectionStrategy) === undefined) {
      store.addStrategy(new FeatureStoreSelectionStrategy({
        map: this.map
      }));
    }
    store.activateStrategyOfType(FeatureStoreSelectionStrategy);

    this.selectedAddress$$ = store.stateView.firstBy$((record: EntityRecord<Address>) => {
      return record.state.selected === true;
    }).subscribe((record: EntityRecord<Address>) => {
      const address = record === undefined ? undefined : record.entity;
      this.selectedAddress$.next(address);
    });
  }

  private initEdition() {
    this.map.viewController.zoomTo(14);
    this.showLayers();
  }

  private showLayers() {
    this.showLayer('buildings');
    this.showLayer('buildingsCorrected');
    this.showLayer('municipality');
    this.showLayer('renovatedCadastre');
  }

  private showLayer(layerId: string) {
    if (layerId) {
      console.log('TEST: ', layerId);
      const layer: Layer = this.map.getLayerById(layerId);
      if (layer !== undefined) { layer.visible = true; }

    } else if (this.layerOptions !== undefined) {
      console.log('layerOptions: ', layerId);
      this.layerService.createAsyncLayer(this.getLayer(layerId)).subscribe((layer: Layer) => {
        layer.visible = true;
        // this.cadastreState.layerCadastreImage = layer;
        this.map.addLayer(layer);
      } );
    }
  }

  private getLayer(layerId: string): LayerOptions {
    this.layerOptions.forEach((layerOption: LayerOptions) => {
      if (layerOption.id = layerId) { return layerOption; }
    });
    return undefined;
  }
}
