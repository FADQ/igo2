import { Injectable } from '@angular/core';

import { FeatureStore } from '@igo2/geo';
import { MapState } from '@igo2/integration';
import { Address } from 'src/lib/address';

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
  public store: FeatureStore = new FeatureStore([], {
    map: this.mapState.map
  });

  /**
   * Store that holds all the available Municipalities
   */
  get adressStore(): FeatureStore<Address> { return this._adressStore; }
  private _adressStore: FeatureStore<Address>;

  /**
   * State of map
   * @type MapState
   */
  get mapState(): MapState { return this._mapState; }

  constructor(private _mapState: MapState) {
    this.initAddress();
  }

  /**
   *Initialise a store of address
   *
   */
  initAddress() {
    this._adressStore = new FeatureStore<Address>([], {
      getKey: (entity: Address) => entity.properties.buildingNumber,
      map: this._mapState.map });
  }

}
