import { Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';

import { BehaviorSubject, Subscription } from 'rxjs';

import { fromExtent } from 'ol/geom/Polygon';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlGeometry from 'ol/geom/Geometry';

import { EntityRecord } from '@igo2/common';
import {
  FeatureStore,
  IgoMap,
  Layer,
  LayerService,
  LayerOptions,
  ModifyControl,
  FeatureStoreSelectionStrategy
 } from '@igo2/geo';

import {
  AddressFeatureList,
  AddressFeature,
  AddressService,
  createAddressStyle
} from '../shared';
import { AddressEditorSaveDialogComponent } from '../address-editor-save-dialog/address-editor-save-dialog.component';
import { AddressEditorZoomDialogComponent } from '../address-editor-zoom-dialog/address-editor-zoom-dialog.component';


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

  /**
   * Selected address of address editor component
   */
  buildingNumber$: BehaviorSubject<number> = new BehaviorSubject(undefined);


  /**
   * Building suffix of address editor component
   */
  buildingSuffix$: BehaviorSubject<string> = new BehaviorSubject(undefined);


  /**
   * Selected address feature of address editor component
   */
  selectedAddressFeature: AddressFeature;

  /**
   * The map to measure on
   */
  @Input() map: IgoMap;

  /**
   * The Feature store
   */
  @Input() store: FeatureStore<AddressFeature>;

  /**
   * The layer Id of Buildings Layer
   */
  @Input() layerIdBuildings: string;

  /**
   * The layer Id of Buildings corrected Layer
   */
  @Input() layerIdBuildingsCorrected: string;

  /**
   * The layer Id of Cadastres Layer
   */
  @Input() layerIdCadastre: string;


  /**
   * The layer Id of Municipalities Layer
   */
  @Input() layerIdMun: string;


  /**
   * The layers options to create the layer if not already existing on the map
   */
  @Input() layerOptions: LayerOptions[];

  private selectedAddress$$: Subscription;
  private olGeometry$$: Subscription;
  private modifyControl: ModifyControl;
  private olGeoJSON = new OlGeoJSON();

  /**
   * Determines whether edition in (if something is in the store)
   */
  get inEdition(): boolean { return this.store.count > 0; }


  /**
   * informs if an address is selected
   */
  get addressIsSelected(): boolean { return this.store.count === 1; }

  constructor(
    private layerService: LayerService,
    private addressService: AddressService,
    private dialogSave: MatDialog,
    private dialogZoom: MatDialog
    ) {}

  /**
   * Add draw controls and activate one
   * @internal
   */
  ngOnInit() {
    this.initModifyControl();
    this.listenAddressSelection();
  }

   /**
   * Toggle the clear buildingNumber and suffix
   * @internal
   */
  ngOnDestroy() {
    if (this.selectedAddress$$ !== undefined) { this.selectedAddress$$.unsubscribe(); }
    if (this.buildingNumber$ !== undefined) { this.buildingNumber$.unsubscribe(); }
    if (this.buildingSuffix$ !== undefined) { this.buildingSuffix$.unsubscribe(); }
    this.deactivateModifyControl();
   }

  /**
   * Handles form edit
   */
  handleFormEdit() {
    this.initEdition();
  }

  /**
   * Handles form save
   */
  handleFormSave() {
    this.manageSave();
  }

  /**
   * Handles form cancel
   */
  handleFormCancel() {
    if (this.selectedAddress$$ !== undefined) { this.selectedAddress$$.unsubscribe(); }
    if (this.buildingNumber$ !== undefined) { this.buildingNumber$.next(undefined); }
    if (this.buildingSuffix$ !== undefined) { this.buildingSuffix$.next(undefined); }
    this.deactivateModifyControl();
    this.store.layer.dataSource.ol.clear();
    this.store.clear();
    this.listenAddressSelection();
    this.store.activateStrategyOfType(FeatureStoreSelectionStrategy);
  }


  /**
   * Listens the address selection
   */
  private listenAddressSelection () {
      this.selectedAddress$$ = this.store.stateView
        .firstBy$((record: EntityRecord<AddressFeature>) => record.state.selected === true)
        .subscribe((record: EntityRecord<AddressFeature>) => {
          this.manageSelectedAddress(record);
      });
  }

  /**
   * Manages an address save
   */
  private manageZoom() {

    const dialogZoomRef = this.dialogZoom.open(AddressEditorZoomDialogComponent);
    const sub = dialogZoomRef.componentInstance.addressZoom.subscribe(() => {
      this.map.viewController.zoomTo(14);
    });
  }


  /**
   * Manages an address save
   */
  private manageSave() {

    const dialogSaveRef = this.dialogSave.open(AddressEditorSaveDialogComponent);
    const sub = dialogSaveRef.componentInstance.addressSave.subscribe(() => {
      console.log('YES');
    });
  }


  /**
   * Manages a selected address
   * @param record The selected address
   */
  private manageSelectedAddress(record: EntityRecord<AddressFeature>) {
    if (record === undefined) { return; }

    if (this.inEdition && !this.addressIsSelected) {
      // Restore the selected address. Only one address at a time could be selected
      this.store.load([record.entity]);
      return;
    } else if (this.addressIsSelected) {
      // Deactivate the selection strategy when an address is selected
      this.store.deactivateStrategyOfType(FeatureStoreSelectionStrategy);
      if (this.selectedAddress$$ !== undefined) {
        this.selectedAddress$$.unsubscribe();
      }
      this.buildingNumber$.next(record.entity.properties.noAdresse);
      this.buildingSuffix$.next(record.entity.properties.suffixeNoCivique);
      this.selectedAddressFeature = record.entity;
      this.activateModifyControl();
      // Add the geometry to the modify control
      const olFeature = this.store.layer.ol.getSource().getFeatureById(record.entity.properties.idAdresseLocalisee);
      this.modifyControl.setOlGeometry(olFeature.getGeometry());
    }
  }

  /**
   * Inits the edition
   */
  private initEdition() {
    this.manageZoom();

    this.showLayers();
    const extentGeometry = this.getMapExtentPolygon('EPSG:4326');
    this.addressService.getAddressesByGeometry(extentGeometry)
    .subscribe((addressList: AddressFeatureList) => {
      this.store.load(addressList);
    });
  }


  /**
   * Gets map extent polygon of the view
   * @param projection The desired geometry projection of the extent geometry
   * @returns A geometry in the desired projection corresponding to the view extent
   */
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
  const layer: Layer = this.map.getLayerById(layerId);
  if (layerExist || layer !== undefined) {
    if (layer !== undefined) { layer.visible = true; }
  } else if (this.layerOptions !== undefined) {
    const layerOptions = this.getLayerOptions(layerId);
    if (layerOptions !== undefined) {
      this.layerService.createAsyncLayer(Object.assign({}, layerOptions, {
        visible: true,
        showInLayerList: false
      })).subscribe((layerCreated: Layer) => this.map.addLayer(layerCreated));
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
  private initModifyControl() {
    this.modifyControl = new ModifyControl({
      drawStyle: createAddressStyle('#336cc6')
    });
  }

  /**
   * Activate a given control
   * @param control Control
   */
  private activateModifyControl() {
    this.olGeometry$$ = this.modifyControl.end$
      .subscribe((olGeometry: OlGeometry) => this.setOlGeometry(olGeometry));
    this.modifyControl.setOlMap(this.map.ol);
  }

  /**
   * Deactivate the active control
   */
  private deactivateModifyControl() {
    if (this.modifyControl !== undefined) {
      this.modifyControl.setOlMap(undefined);
    }

    if (this.olGeometry$$ !== undefined) {
      this.olGeometry$$.unsubscribe();
    }
  }

  /**
   * When drawing ends, convert the output value to GeoJSON and keep it.
   * Restore the double click interaction.
   * @param olGeometry OL geometry
   */
  private setOlGeometry(olGeometry: OlGeometry | undefined) {
    if (olGeometry === undefined || this.selectedAddressFeature === undefined) { return; }
    const olGeoJSON = new OlGeoJSON();
    this.selectedAddressFeature.geometry = olGeoJSON.writeGeometryObject(olGeometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: this.map.projection
    });
  }
}
