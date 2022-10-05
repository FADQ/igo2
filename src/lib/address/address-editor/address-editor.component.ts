import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { BehaviorSubject, Subscription } from 'rxjs';

import OlGeoJSON from 'ol/format/GeoJSON';
import OlGeometry from 'ol/geom/Geometry';

import { EntityRecord } from '@igo2/common';
import {
  FeatureStore,
  IgoMap,
  FeatureGeometry,
  FeatureStoreSelectionStrategy,
  FeatureDataSource,
  FeatureStoreLoadingStrategy,
  FeatureMotion,
  Layer,
  LayerService,
  LayerOptions,
  ModifyControl,
  tryBindStoreLayer,
  tryAddLoadingStrategy,
  tryAddSelectionStrategy,
  VectorLayer,
  WMSDataSource,
} from '@igo2/geo';

import { getMapExtentPolygon } from '../../map/shared/map.utils';

import {
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
   * Zoom level edition of address editor component
   */
  static zoomLevelEdition = 13;

  /**
   * Selected address of address editor component
   */
  buildingNumber$: BehaviorSubject<number> = new BehaviorSubject(undefined);

  /**
   * Building suffix of address editor component
   */
  buildingSuffix$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * Determines whether edition$ in
   */
  inEdition$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
  @Input() layerAliasBuildings: string;

  /**
   * The layer Id of Buildings corrected Layer
   */
  @Input() layerAliasBuildingsCorrected: string;

  /**
   * The layer Id of Cadastres Layer
   */
  @Input() layerAliasCadastre: string;


  /**
   * The layer Id of Municipalities Layer
   */
  @Input() layerAliasMun: string;


  /**
   * The layers options to create the layer if not already existing on the map
   */
  @Input() layerOptions: LayerOptions[];

  @ViewChild('save', {read: ElementRef}) saveElement: ElementRef;

  private selectedAddress$$: Subscription;
  private olGeometry$$: Subscription;
  private modifyControl: ModifyControl;
  private dialogZoom$$: Subscription;
  private dialogSave$$: Subscription;

  /**
   * Determines whether edition in (if something is in the store)
   */
  get storeIsFilled(): boolean { return this.store.count > 0; }

  /**
   * informs if an address is selected
   */
  get addressIsSelected(): boolean { return this.store.count === 1; }

  constructor(
    private layerService: LayerService,
    private addressService: AddressService,
    private dialog: MatDialog
    ) {}

  /**
   * Add draw controls and activate one
   * @internal
   */
  ngOnInit() {
    this.initStore();
    // If there's something in the store, it means we were in edition mode
    this.inEdition$.next(this.storeIsFilled);
    this.initModifyControl();
    this.subscribeToAddressSelection();
  }

   /**
   * Toggle the clear buildingNumber and suffix
   * @internal
   */
  ngOnDestroy() {
    if (this.dialogZoom$$ !== undefined) { this.dialogZoom$$.unsubscribe(); }
    if (this.dialogSave$$ !== undefined) { this.dialogSave$$.unsubscribe(); }
    this.closeEdition(true);
   }

  /**
   * Handles form edit
   */
  handleFormEdit() {
    if (this.map.viewController.getZoom() < AddressEditorComponent.zoomLevelEdition) {
      this.manageZoom();
    } else {
      this.initEdition();
    }
  }

  /**
   * Handles form save
   */
  handleFormSave() {
    this.blurSave();
    this.manageSave();
  }

  /**
   * Handles form cancel
   */
  handleFormCancel() {
    this.closeEdition(true);
  }

  /**
   * Blurs the save button
   */
  blurSave() {
    this.saveElement.nativeElement.blur();
  }

  /**
   * Inits the store
   */
  private initStore() {
    this.trybindStoreLayer();
    tryAddLoadingStrategy(this.store, new FeatureStoreLoadingStrategy({motion: FeatureMotion.None}));
    tryAddSelectionStrategy(this.store, new FeatureStoreSelectionStrategy({
      map: this.map,
      motion: FeatureMotion.None
    }));
  }

  /**
   * Try to bind a layer to the store
   */
  private trybindStoreLayer() {
    const layer = new VectorLayer({
      zIndex: 200,
      source: new FeatureDataSource(),
      style: createAddressStyle('#f7ef0e'),
      showInLayerList: false
    });
    tryBindStoreLayer(this.store, layer);
  }

  /**
   * Listens the address selection
   */
  private subscribeToAddressSelection () {
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
    const dialogZoomRef = this.dialog.open(AddressEditorZoomDialogComponent);
    this.dialogZoom$$ = dialogZoomRef.componentInstance.addressZoom.subscribe((response: boolean) => {
      // Do not use the zoomTo function of the view because there's an animation with delay.
      // In our case, it must be direct because we use the extent of the zoomed view.
      this.map.ol.getView().setZoom(AddressEditorComponent.zoomLevelEdition);
      this.initEdition();
    });
    // unsubscribe
    dialogZoomRef.afterClosed().subscribe(() => {
      this.dialogZoom$$.unsubscribe();
    });
  }

  /**
   * Manages an address save
   */
  private manageSave() {
    // Only one address could be saved
    if (!this.addressIsSelected) { return; }

    const dialogSaveRef = this.dialog.open(AddressEditorSaveDialogComponent);
    this.dialogSave$$ = dialogSaveRef.componentInstance.addressSave.subscribe((response: boolean) => {
      if (response === true) {
        this.addressService.modifyAddressGeometry(
          this.selectedAddressFeature.properties.idAdresseLocalisee,
          this.selectedAddressFeature
          ).subscribe(() => {
            this.closeEdition(false);
            // Refresh the buildingCorrected layer
            const layer: Layer = this.map.getLayerByAlias('buildingsCorrected');
            if (layer.dataSource instanceof WMSDataSource ) {
              (layer.dataSource as WMSDataSource).refresh();
            }
          });
      }
    });
    // unsubscribe
    dialogSaveRef.afterClosed().subscribe(() => {
      this.dialogSave$$.unsubscribe();
    });
  }

  /**
   * Close the edition mode
   */
  private closeEdition(hideLayers: boolean) {
    if (this.selectedAddress$$ !== undefined) { this.selectedAddress$$.unsubscribe(); }
    if (this.buildingNumber$ !== undefined) { this.buildingNumber$.next(undefined); }
    if (this.buildingSuffix$ !== undefined) { this.buildingSuffix$.next(undefined); }
    this.deactivateModifyControl();
    this.store.layer.dataSource.ol.clear();
    this.store.clear();
    this.subscribeToAddressSelection();
    this.store.activateStrategyOfType(FeatureStoreSelectionStrategy);
    this.inEdition$.next(false);
    if (hideLayers) { this.hideLayers(); }
  }

  /**
   * Manages a selected address
   * @param record The selected address
   */
  private manageSelectedAddress(record: EntityRecord<AddressFeature>) {
    if (record === undefined) { return; }

    if (this.storeIsFilled && !this.addressIsSelected) {
      // Restore the selected address. Only one address at a time could be selected
      this.store.load([record.entity]);
    }

    if (!this.addressIsSelected) { return; }

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

  /**
   * Inits the edition
   */
  private initEdition() {
    this.inEdition$.next(true);
    this.showLayers();
    const extentGeometry = getMapExtentPolygon(this.map, 'EPSG:4326');
    this.addressService.getAddressesByGeometry(extentGeometry)
      .subscribe((addressList: AddressFeature[]) => {
        this.store.load(addressList);
      });
  }

  /**
   * Shows all layers related to this tool
   */
  private showLayers() {
    this.showLayer('buildings', this.layerAliasBuildings === 'buildings');
    this.showLayer('buildingsCorrected', this.layerAliasBuildingsCorrected === 'buildingsCorrected');
    this.showLayer('mun', this.layerAliasMun === 'mun');
    this.showLayer('cadastre_reno', this.layerAliasCadastre === 'cadastre_reno');
  }
  /**
   * Shows layer
   * @param layerAlias Layer alias
   * @param layerExist Indicates if the layer already exists on the map
   */
  private showLayer(layerAlias: string, layerExist: boolean) {
    const layer: Layer = this.map.getLayerByAlias(layerAlias);
    if (layerExist || layer !== undefined) {
      if (layer !== undefined) { layer.visible = true; }
    } else if (this.layerOptions !== undefined) {
      const layerOptions = this.getLayerOptions(layerAlias);
      if (layerOptions !== undefined) {
        this.layerService.createAsyncLayer(Object.assign({}, layerOptions, {
          visible: true,
          showInLayerList: false
        })).subscribe((layerCreated: Layer) => this.map.addLayer(layerCreated));
      }
    }
  }

  /**
   * Hides all layers related to this tool
   */
  private hideLayers() {
    this.hideLayer(this.layerAliasBuildings);
    this.hideLayer(this.layerAliasBuildingsCorrected);
    this.hideLayer(this.layerAliasMun);
    this.hideLayer(this.layerAliasCadastre);
  }
/**
 * Shows layer
 * @param layerAlias Layer alias
 * @param layerExist Indicates if the layer already exists on the map
 */
  private hideLayer(layerAlias: string) {
    let layer: Layer;
    if (layerAlias !== undefined) {
      layer = this.map.getLayerByAlias(layerAlias);
    } else {
      layer = this.map.getLayerByAlias(this.getLayerOptions(layerAlias).alias);
    }
    if (layer !== undefined) { layer.visible = false; }
  }

  /**
   * Gets layer options from the layerOptions list received from the context
   * @param layerAlias Layer alias
   * @returns The layer options
   */
  private getLayerOptions(layerAlias: string): LayerOptions {
    for (const layerOptions of this.layerOptions) {
      if (layerOptions.alias === layerAlias) { return layerOptions; }
    }
    return undefined;
  }

  /**
   * Create a modify control and subscribe to it's geometry
   */
  private initModifyControl() {
    if (this.modifyControl === undefined) {
      this.modifyControl = new ModifyControl({
        drawStyle: createAddressStyle('#336cc6')
      });
    }
  }

  /**
   * Activate a given control
   * @param control Control
   */
  private activateModifyControl() {
    this.initModifyControl();
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
      this.modifyControl = undefined;
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
    const geometry = olGeoJSON.writeGeometryObject(olGeometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: this.map.projection
    });
    this.selectedAddressFeature.geometry = geometry as FeatureGeometry;
  }
}
