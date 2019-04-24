import { Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { fromExtent } from 'ol/geom/Polygon';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlGeometry from 'ol/geom/Geometry';
import OlFeature from 'ol/Feature';
import OlVectorSource from 'ol/source/Vector';
import OlVectorLayer from 'ol/layer/Vector';

import { EntityRecord } from '@igo2/common';
import { FeatureStore,
  IgoMap,
  Layer,
  LayerService,
  LayerOptions,
  ModifyControl,
  GeoJSONGeometry
 } from '@igo2/geo';

import { AddressFeatureList, AddressFeature } from '../shared/address.interface';
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

  private selectedAddress$$: Subscription;
  private olGeometry$: Subscription;
  private modifyControl: ModifyControl;
  private olGeoJSON = new OlGeoJSON();
  private ready = false;
  private selectedAddressFeature: AddressFeature;

  /**
   * Selected address$ of address editor component
   */
  // selectedAddress$: BehaviorSubject<AddressFeature> = new BehaviorSubject<AddressFeature>(undefined);

  /**
   * Selected address of address editor component
   */
  buildingNumber$: BehaviorSubject<number> = new BehaviorSubject(undefined);


  /**
   * Building suffix of address editor component
   */
  buildingSuffix$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  selectedAddressFeature$: BehaviorSubject<AddressFeature> = new BehaviorSubject(undefined);

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

  /**
   * Determines whether edition in
   */
  inEdition: boolean = false;


  /**
   * Disabled  of address editor component
   */
  disabled: boolean = false;


  /**
   * Gets building number
   */
  /*get buildingNumber(): number {
    if (this.selectedAddress$.getValue() === undefined) { return null; }
    return this.selectedAddress$.getValue().properties.noAdresse;
  }*/

  /*get buildingSuffix(): string {
    if (this.selectedAddress$.getValue() === undefined) { return null; }
    return this.selectedAddress$.getValue().properties.suffixeNoCivique;
  }*/

  constructor(
    private cdRef: ChangeDetectorRef,
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
        this.manageSelectedAddress(record);
        if (record !== undefined && record.entity !== undefined) {
          this.activateControl();
          const olFeature = this.store.layer.ol.getSource().getFeatureById(record.entity.properties.idAdresseLocalisee);
          this.modifyControl.setOlGeometry(olFeature.getGeometry());
        }
      });
    this.map.viewController.zoomTo(14);
  }
   /**
   * Toggle the clear buildingNumber and suffix
   * @internal
   */
  ngOnDestroy() {
    this.selectedAddress$$.unsubscribe();
    this.deactivateControl();
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
    this.deactivateControl();
    this.store.layer.dataSource = null;
  }

  private manageSelectedAddress(record: EntityRecord<AddressFeature>) {
    if (record === undefined) { 
      this.buildingNumber$.next(null);
      this.buildingSuffix$.next(null);
      return;
    }

    const address = record ? record.entity : undefined;
    const buildingNumber = address ? address.properties.noAdresse : null;
    const buildingSuffix = address ? address.properties.suffixeNoCivique : null;
    this.buildingNumber$.next(buildingNumber);
    this.buildingSuffix$.next(buildingSuffix);
    if (record.entity !== undefined) {
      this.selectedAddressFeature$.next(record.entity);
    }
  }

  /**
   * Inits the edition
   */
  private initEdition() {
    this.showLayers();
    const extentGeometry = this.getMapExtentPolygon('EPSG:4326');
    this.addressService.getAddressesByGeometry(extentGeometry)
    .subscribe((addressList: AddressFeatureList) => {
      this.store.load(addressList);
    });
  }

  private getMapExtentPolygon(projection: string) {
    return this.olGeoJSON.writeGeometryObject(fromExtent(this.map.viewController.getExtent(projection)));
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

  /**
   * Create a modify control and subscribe to it's geometry
   */
  private createModifyControl() {
    this.modifyControl = new ModifyControl({});
  }

  /**
   * Activate a given control
   * @param control Control
   */
  private activateControl() {
    this.createModifyControl();
    this.olGeometry$ = this.modifyControl.end$
      .subscribe((olGeometry: OlGeometry) => this.setOlGeometry(olGeometry));
    this.modifyControl.setOlMap(this.map.ol);
  }

  /**
   * Deactivate the active control
   */
  private deactivateControl() {
    if (this.modifyControl !== undefined) {
      this.modifyControl.setOlMap(undefined);
    }
    if (this.olGeometry$ !== undefined) {
      this.olGeometry$.unsubscribe();
    }
    this.modifyControl = undefined;
  }

  /**
   * When drawing ends, convert the output value to GeoJSON and keep it.
   * Restore the double click interaction.
   * @param olGeometry OL geometry
   */
  private setOlGeometry(olGeometry: OlGeometry | undefined) {
    const olGeoJSON = new OlGeoJSON();
    console.log(this.selectedAddressFeature$.value.geometry, this.selectedAddressFeature$.value.projection);
    this.selectedAddressFeature$.value.geometry = olGeoJSON.writeGeometryObject(olGeometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: this.map.projection
    });
    this.selectedAddressFeature$.value.projection = olGeometry;
    console.log(this.selectedAddressFeature$.value.geometry, this.selectedAddressFeature$.value.projection);


    /*const meta = Object.assign({}, baseElement.meta, {
      id: uuid()
    });
    const properties = Object.assign({}, baseElement.properties, {
      idElementGeometrique: undefined,
      description: undefined,
      etiquette: undefined
    });
    this.selectedAddressFeature = Object.assign({}, baseElement, {
      meta,
      properties,
      geometry: olGeoJSON.writeGeometryObject(olGeometry, {
        dataProjection: baseElement.projection,
        featureProjection: this.map.projection
      })
    });*/
  }

}
