import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import {
  EntityRecord,
  EntityTransaction,
  EntityTableTemplate,
  WidgetComponent,
  getEntityRevision
} from '@igo2/common';
import { LanguageService, Message, MessageType } from '@igo2/core';
import {
  IgoMap,
  VectorLayer,
  FEATURE,
  Feature,
  FeatureStore,
  FeatureDataSource,
  FeatureStoreSelectionStrategy,
  FeatureStoreLoadingStrategy,
  FeatureMotion
} from '@igo2/geo';

import { EditionResult } from '../shared/edition.interfaces';
import { getOperationTitle as getDefaultOperationTitle } from '../shared/edition.utils';

@Component({
  selector: 'fadq-edition-fill',
  templateUrl: './edition-fill.component.html',
  styleUrls: ['./edition-fill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionFillComponent implements WidgetComponent, OnInit, OnDestroy {

  /**
   * Exclusion table template
   * @internal
   */
  tableTemplate: EntityTableTemplate = {
    sort: false,
    selection: true,
    selectMany: true,
    selectionCheckbox: true,
    columns: [
      {
        name: 'properties.title',
        title: 'Exclusion(s) à réinclure'
      }
    ]
  };

  /**
   * Exclusion store
   * @internal
   */
  exclusionStore: FeatureStore;

  /**
   * Message, if any
   * @internal
   */
  message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Map to draw features on
   */
  @Input() map: IgoMap;

  /**
   * Feature store
   */
  @Input() store: FeatureStore;

  /**
   * Transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Schema feature
   */
  @Input() feature: Feature;

  /**
   * Title
   */
  @Input() title: string;

  /**
   * Process data before submit
   */
  @Input() processData: (data: Feature) => EditionResult | Observable<EditionResult>;

  /**
   * Generate an operation title
   */
  @Input() getOperationTitle: (data: Feature, languageService: LanguageService) => string;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<Feature>();

  /**
   * Event emitted on cancel
   * @internal
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(private languageService: LanguageService) {}

  /**
   * Create the exclusion store and add a layer of exclusions
   * to the map
   * @internal
   */
  ngOnInit() {
    this.exclusionStore = this.createExclusionStore();
    this.map.ol.addLayer(this.exclusionStore.layer.ol);
  }

  /**
   * Clear the exclusion store and remove the layer of exclusions
   * from the map
   * @internal
   */
  ngOnDestroy() {
    this.teardown();
  }

  /**
   * Remove the exclusions from the base feature then,
   * do any additional processing of the feature (optional).
   * @internal
   */
  onSubmit() {
    const feature = this.updateFeature();
    if (typeof this.processData === 'function') {
      const resultOrObservable = this.processData(feature);
      if (resultOrObservable instanceof Observable) {
        resultOrObservable.subscribe((result: EditionResult) => {
          this.submitResult(result);
        });
      } else {
        this.submitResult(resultOrObservable);
      }
    } else {
      this.submitResult({feature});
    }
  }

  /**
   * Emit the cancel event
   * @internal
   */
  onCancel() {
    this.teardown();
    this.cancel.emit();
  }

  private teardown() {
    this.map.ol.removeLayer(this.exclusionStore.layer.ol);
    this.exclusionStore.clear();
  }

  /**
   * Display  an error message, if any
   * @param result Edition result
   */
  private submitResult(result: EditionResult) {
    const error = result.error;
    if (error === undefined) {
      this.message$.next(undefined);
      this.onSubmitSuccess(result.feature);
    } else {
      this.message$.next({
        type: MessageType.ERROR,
        text: error
      });
    }
  }

  /**
   * Add the base feature to the transaction and emit the complete event
   * @param feature Feature
   */
  private onSubmitSuccess(feature: Feature) {
    if (this.transaction !== undefined && this.store !== undefined) {
      this.addToTransaction(feature);
    }
    this.complete.emit(feature);
  }

  /**
   * Add the updated and processed base feature to the transaction
   * @param feature Feature
   */
  private addToTransaction(feature: Feature) {
    const getOperationTitle = this.getOperationTitle ? this.getOperationTitle : getDefaultOperationTitle;
    const operationTitle = getOperationTitle(feature, this.languageService);
    this.transaction.update(this.feature, feature, this.store, {
      title: operationTitle
    });
  }

  /**
   * Create an exclusion store with selection capabilities
   * and load the base feature's exclusions into it.
   * @returns Exclusion store
   */
  private createExclusionStore(): FeatureStore {
    const getKey = (exclusion: Feature) => exclusion.properties.id;
    const exclusionStore = new FeatureStore([], {
      map: this.map,
      getKey
    });

    const layer = new VectorLayer({
      zIndex: 500,
      source: new FeatureDataSource()
    });
    exclusionStore.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingStrategy({
      getFeatureId: getKey,
      motion: FeatureMotion.None
    });
    exclusionStore.addStrategy(loadingStrategy, true);

    const selectionStrategy = new FeatureStoreSelectionStrategy({
      map: this.map,
      many: true,
      motion: FeatureMotion.None,
      getFeatureId: getKey
    });
    exclusionStore.addStrategy(selectionStrategy, true);

    const exclusionCoordinates = this.feature.geometry.coordinates.slice(1);
    const exclusions = exclusionCoordinates.map((coordinates: number[], index: number) => {
      return {
        type: FEATURE,
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        },
        properties: {
          index: index + 1,
          id: index + 1,
          title: `Exclusion #${index}`
        }
      };
    });

    exclusionStore.load(exclusions);

    return exclusionStore;
  }

  /**
   * Remove the selected exclusions from the base feature
   * @returns Updated feature
   */
  private updateFeature() {
    const keepExclusions = this.exclusionStore.stateView
      .manyBy((record: EntityRecord<Feature>) => record.state.selected !== true)
      .map((record: EntityRecord<Feature>) => record.entity);

    const exclusionCoordinates = keepExclusions.map(( exclusion: Feature) => exclusion.geometry.coordinates[0]);
    const newCoordinates = [this.feature.geometry.coordinates[0], ...exclusionCoordinates];

    const featureMeta = Object.assign({}, this.feature.meta, {
      revision: getEntityRevision(this.feature) + 1
    });
    const feature = Object.assign({}, this.feature, {
      meta: featureMeta,
      geometry: {
        type: 'Polygon',
        coordinates: newCoordinates
      }
    });

    return feature;
  }

}
