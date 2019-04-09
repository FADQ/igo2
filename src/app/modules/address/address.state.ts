import { Injectable } from '@angular/core';

import { FeatureStore } from '@igo2/geo';
import { MapState } from '@igo2/integration';

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

  constructor(private mapState: MapState) {}

}
