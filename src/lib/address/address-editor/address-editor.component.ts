import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { fromExtent } from 'ol/geom/Polygon';
import OlGeoJSON from 'ol/format/GeoJSON';
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
import { Address, AddressFeatureList, AddressFeature } from '../shared/address.interface';
import { AddressService } from '../shared/address.service';

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

  selectedAddress$: BehaviorSubject<AddressFeature> = new BehaviorSubject<AddressFeature>(undefined);

  private selectedAddress$$: Subscription;

  /**
   * The map to measure on
   */
  @Input() map: IgoMap;

  /**
   * The store
   */
  @Input() store: FeatureStore<AddressFeature>;
  @Input() layerIdBuildings: string;
  @Input() layerIdBuildingsCorrected: string;
  @Input() layerIdCadastre: string;
  @Input() layerIdMun: string;
  @Input() layerOptions: LayerOptions[];

  inEdition: boolean = false;

  disabled: boolean = false;

  get buildingNumber(): number {
    if (this.selectedAddress$.getValue() === undefined) { return null; }
    return this.selectedAddress$.getValue().properties.noAdresse;
  }

  get buildingSuffix(): string {
    if (this.selectedAddress$.getValue() === undefined) { return null; }
    return this.selectedAddress$.getValue().properties.suffixeNoCivique;
  }

  constructor(
    private layerService: LayerService,
    private addressService: AddressService,
    ) {}

  /**
   * Add draw controls and activate one
   * @internal
   */
  ngOnInit() {
    this.selectedAddress$$ = this.store.stateView
      .firstBy$((record: EntityRecord<AddressFeature>) => record.state.selected === true)
      .subscribe((record: EntityRecord<AddressFeature>) => {
        this.selectedAddress$.next(record ? record.entity : undefined);
      });
    this.map.viewController.zoomTo(14);
  }
   /**
   * Toggle the clear buildingNumber and suffix
   * @internal
   */
  ngOnDestroy() {
    this.selectedAddress$$.unsubscribe();
  }

  /**
   * Handles form edit
   */
  handleFormEdit() {
    this.inEdition = true;
    this.initEdition();
  }


  /**
   * Handles form save
   */
  handleFormSave() {
    this.inEdition = false;
  }


  /**
   * Handles form cancel
   */
  handleFormCancel() {
    this.inEdition = false;
  }

  /**
   * Inits the edition
   */
  private initEdition() {
    const olGeoJSON = new OlGeoJSON();

    this.showLayers();
    const extentGeometry = this.getMapExtentPolygon('EPSG:4326');
    this.addressService.getAddressesByGeometry(extentGeometry)
    .subscribe((addressList: AddressFeatureList) => {
      this.store.load(addressList);
    });
  }

  private getMapExtentPolygon(projection: string) {
    const olGeoJSON = new OlGeoJSON();
    return olGeoJSON.writeGeometryObject(fromExtent(this.map.viewController.getExtent(projection)));
  }

  /**
   * Shows all layers related to this tool
   */
  private showLayers() {
    this.showLayer('buildings', this.layerIdBuildings === 'buildings');
    this.showLayer('buildingsCorrected', this.layerIdBuildingsCorrected === 'buildingsCorrected');
    this.showLayer('mun', this.layerIdMun === 'mun');
    // this.showLayer('cadastre_reno', this.layerIdCadastre === 'cadastre_reno');
  }
/**
 * Shows layer
 * @param layerId Layer id
 * @param layerExist Indicates if the layer already exists on the map
 */
private showLayer(layerId: string, layerExist: boolean) {
    if (layerExist) {
      const layer: Layer = this.map.getLayerById(layerId);
      if (layer !== undefined) { layer.visible = true; }
    } else if (this.layerOptions !== undefined) {
      const layerOptions = this.getLayerOptions(layerId);
      if (layerOptions !== undefined) {
        this.layerService.createAsyncLayer(Object.assign({}, layerOptions, {
          visible: true,
          showInLayerList: false
        })).subscribe((layer: Layer) => this.map.addLayer(layer));
      }
    }
  }

  /**
   * Gets layer options from the layerOptions list received from the context
   * @param layerId Layer id
   * @returns The layer options
   */
  private getLayerOptions(layerId: string): LayerOptions {
    for (const layerOptions of this.layerOptions) {
      if (layerOptions.id === layerId) { return layerOptions; }
    }
    return undefined;
  }
}
