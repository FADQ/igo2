import { Injectable } from '@angular/core';

import * as olstyle from 'ol/style';

import {
  FeatureStore,
  VectorLayer,
  FeatureDataSource,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  IgoMap,
  createOverlayMarkerStyle,
  tryBindStoreLayer,
  tryAddLoadingStrategy,
  FeatureStoreLoadingStrategyOptions,
  FeatureMotion,
  tryAddSelectionStrategy,
  FeatureStoreStrategy
} from '@igo2/geo';
import { MapState } from '@igo2/integration';

import { AddressFeature, createAddressStyle } from 'src/lib/address';


/**
 * Service that holds the state of the measure module
 */
@Injectable({
  providedIn: 'root'
})
export class AddressState {

  /**
   * Store that holds all the available Municipalities
   */
  get adressStore(): FeatureStore<AddressFeature> { return this._adressStore; }
  private _adressStore: FeatureStore<AddressFeature>;

  /**
   * State of map
   * @type MapState
   */
  get mapState(): MapState { return this._mapState; }

  constructor(private _mapState: MapState) {
    this.initAddressStore();
  }

  /**
   *Initialise a store of address
   *
   */
  initAddressStore() {
    this._adressStore = new FeatureStore<AddressFeature>([], {
      getKey: (entity: AddressFeature) => entity.properties.idAdresseLocalisee,
      map: this._mapState.map });

    this.trybindStoreLayer(this._adressStore);
    tryAddLoadingStrategy(this._adressStore, new FeatureStoreLoadingStrategy({motion: FeatureMotion.None}));
    tryAddSelectionStrategy(this._adressStore, new FeatureStoreSelectionStrategy({
      map: this.mapState.map,
      motion: FeatureMotion.None
    }));
  }

  private trybindStoreLayer(store: FeatureStore) {
    const layer = new VectorLayer({
      zIndex: 200,
      source: new FeatureDataSource(),
      style: createAddressStyle('#f7ef0e'),
      showInLayerList: false
    });
    tryBindStoreLayer(store, layer);
  }
}
