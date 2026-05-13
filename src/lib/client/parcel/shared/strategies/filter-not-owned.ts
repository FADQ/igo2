import { EntityStoreStrategy } from '@igo2/common/entity';
import { FeatureStore } from '@igo2/geo';

import { ClientParcel } from '../client-parcel.interfaces';

/**
 * When active, this strategy filters a store's diew to return
 * parcels owned by the client only.
 */
export class FeatureStoreFilterNotOwnedStrategy extends EntityStoreStrategy {

  /**
   * Store / filter ids map
   */
  private filters: Map<FeatureStore<ClientParcel>, string> = new Map();

  /**
   * Bind this strategy to a store and start filtering it
   * @param store Entity store
   */
  bindStore(store: any) {
    super.bindStore(store);

    if (this.active === true) {
      this.filterStore(store as FeatureStore<ClientParcel>);
    }
  }

  /**
   * Unbind this strategy from a store and stop filtering it
   * @param store Entity store
   */
  unbindStore(store: any) {
    super.unbindStore(store);

    if (this.active === true) {
      this.unfilterStore(store as FeatureStore<ClientParcel>);
    }
  }

  /**
   * Start filtering all stores
   * @internal
   */
  protected doActivate() {
    this.filterAll();
  }

  /**
   * Stop filtering all stores
   * @internal
   */
  protected doDeactivate() {
    this.unfilterAll();
  }

  /**
   * Filter all stores
   */
  private filterAll() {
    this.stores.forEach((store: any) =>
      this.filterStore(store as FeatureStore<ClientParcel>)
    );
  }

  /**
   * Unfilter all stores
   */
  private unfilterAll() {
    this.stores.forEach((store: any) =>
      this.unfilterStore(store as FeatureStore<ClientParcel>)
    );
  }

  /**
   * Filter a store and add it to the filters map
   */
  private filterStore(store: FeatureStore<ClientParcel>) {
    if (this.filters.has(store)) {
      return;
    }

    const filter = (parcel: ClientParcel) => {
      return [1, 2].includes(parcel.properties.relation);
    };
    this.filters.set(store, store.view.addFilter(filter));
  }

  /**
   * Unfilter a store and delete it from the filters map
   */
  private unfilterStore(store: FeatureStore<ClientParcel>) {
    const filterId = this.filters.get(store);
    if (filterId === undefined) {
      return;
    }

    store.view.removeFilter(filterId);
    this.filters.delete(store);
  }
}
