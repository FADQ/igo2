import { Injectable } from '@angular/core';
import * as olstyle from 'ol/style';

import { FeatureStore, VectorLayer, FeatureDataSource, FeatureStoreLoadingStrategy, FeatureStoreSelectionStrategy, IgoMap, createOverlayMarkerStyle } from '@igo2/geo';
import { MapState } from '@igo2/integration';
import { Address, AddressFeature } from 'src/lib/address';

/**
 * Service that holds the state of the measure module
 */
@Injectable({
  providedIn: 'root'
})
export class AddressState {

  /**
   * Store that holds the measures
   */
  /*public store: FeatureStore = new FeatureStore([], {
    map: this.mapState.map,
    getKey: (entity: AddressFeature) => entity.properties.idAdresseLocalisee
  });*/

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
    this._adressStore = this.initStore(this._adressStore) as FeatureStore<AddressFeature> ;
  }

  /**
   * Initialize the measure store and set up some listeners
   * @internal
   */
  private initStore(store: FeatureStore) {

    if (store.layer === undefined) {
      const layer = new VectorLayer({
        zIndex: 200,
        source: new FeatureDataSource(),
        style: this.createOverlayDefaultStyle()
      });
      layer.options.showInLayerList = false;
      store.bindLayer(layer);
    }

    if (store.layer.map === undefined) {
      this.mapState.map.addLayer(store.layer);
    }

    if (store.getStrategyOfType(FeatureStoreLoadingStrategy) === undefined) {
      store.addStrategy(new FeatureStoreLoadingStrategy({}));
    }
    store.activateStrategyOfType(FeatureStoreLoadingStrategy);

    if (store.getStrategyOfType(FeatureStoreSelectionStrategy) === undefined) {
      store.addStrategy(new FeatureStoreSelectionStrategy({
        map: this.mapState.map
      }));
    }
    store.activateStrategyOfType(FeatureStoreSelectionStrategy);

    return store;
  }

  private createOverlayDefaultStyle(): olstyle.Style {
    const stroke = new olstyle.Stroke({
      width: 2,
      color: [224, 38, 13, 1]
    });

    const fill = new olstyle.Stroke({
      color: [0, 161, 222, 0.15]
    });

    return new olstyle.Style({
      stroke,
      fill,
      image: new olstyle.Circle({
        radius: 7,
        stroke,
        fill
      }),
      text: new olstyle.Text({
        font: '12px Calibri,sans-serif',
        fill: new olstyle.Fill({ color: '#000' }),
        stroke: new olstyle.Stroke({ color: '#fff', width: 3 }),
        overflow: true
      })
    });
  }

}
