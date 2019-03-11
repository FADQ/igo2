import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EntityRecord } from '@igo2/common';
import { FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  FeatureDataSource,
  VectorLayer,
  IgoMap
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

  selectedAddress$: BehaviorSubject<Address> = new BehaviorSubject(undefined);

  private selectedAddress$$: Subscription;

  /**
   * The map to measure on
   */
  @Input() map: IgoMap;

  /**
   * The store
   */
  @Input() store: FeatureStore;

  @Input() inEdition: boolean;

  handleFormEdit(isClick: boolean) {
    // this.submitted = true;
    if (isClick) {
      this.inEdition = true;
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

  constructor() {}

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
      store.bindLayer(layer);
    }

    if (store.layer.map === undefined) {
      this.map.addLayer(store.layer);
    }

    if (store.getStrategyOfType(FeatureStoreLoadingStrategy) === undefined) {
      store.addStrategy(new FeatureStoreLoadingStrategy());
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
}
