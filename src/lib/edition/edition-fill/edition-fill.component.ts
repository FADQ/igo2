import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import {
  EntityRecord,
  EntityTransaction,
  EntityTableTemplate,
  WidgetComponent,
  getEntityRevision
} from '@igo2/common';
import { LanguageService } from '@igo2/core';
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
export class EditionFillComponent implements WidgetComponent {

  tableTemplate: EntityTableTemplate = {
    sort: false,
    selection: true,
    selectMany: true,
    selectionCheckbox: true,
    columns: [
      {
        name: 'properties.title',
        title: 'Exclusion'
      }
    ]
  };

  exclusionStore: FeatureStore;

  /**
   * Import error, if any
   * @internal
   */
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject(undefined);

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
   * Process data before submit
   */
  @Input() processData: (data: Feature) => EditionResult | Observable<EditionResult>;

  /**
   * Process data before submit
   */
  @Input() getOperationTitle: (data: Feature, languageService: LanguageService) => EditionResult | Observable<EditionResult>;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<Feature>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.exclusionStore = this.createExclusionStore();
    this.map.ol.addLayer(this.exclusionStore.layer.ol);
  }

  ngOnDestroy() {
    this.map.ol.removeLayer(this.exclusionStore.layer.ol);
    this.exclusionStore.clear();
  }

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

  onCancel() {
    this.cancel.emit();
  }

  private submitResult(result: EditionResult) {
    const error = result.error;
    this.errorMessage$.next(error);

    if (error === undefined) {
      this.onSubmitSuccess(result.feature);
    }
  }

  private onSubmitSuccess(feature: Feature) {
    if (this.transaction !== undefined && this.store !== undefined) {
      this.addToTransaction(feature);  
    }
    this.complete.emit(feature);
  }

  private addToTransaction(feature: Feature) {
    const getOperationTitle = this.getOperationTitle ? this.getOperationTitle : getDefaultOperationTitle;
    const operationTitle = getOperationTitle(feature, this.languageService);
    this.transaction.update(this.feature, feature, this.store, {
      title: operationTitle
    });
  }

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
