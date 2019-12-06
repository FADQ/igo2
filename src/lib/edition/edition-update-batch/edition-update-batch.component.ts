import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  Subscription,
  of,
  zip
} from 'rxjs';

import {
  EntityTransaction,
  Form,
  FormField,
  WidgetComponent,
  OnUpdateInputs,
  getAllFormFields,
  getEntityRevision
} from '@igo2/common';
import { LanguageService, Message, MessageType } from '@igo2/core';
import { FEATURE, Feature, FeatureStore } from '@igo2/geo';

import { EditionResult } from '../shared/edition.interfaces';
import { getOperationTitle as getDefaultOperationTitle } from '../shared/edition.utils';

@Component({
  selector: 'fadq-edition-update-batch',
  templateUrl: './edition-update-batch.component.html',
  styleUrls: ['./edition-update-batch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionUpdateBatchComponent
    implements OnUpdateInputs, WidgetComponent, OnInit, OnDestroy {

  /**
   * Message
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Base feature
   * @internal
   */
  readonly baseFeature$: BehaviorSubject<Partial<Feature>> = new BehaviorSubject(undefined);

  /**
   * Subscription to the processData function
   */
  private result$$: Subscription;

  /**
   * Create form
   */
  @Input() form: Form;

  /**
   * Base features
   */
  @Input() features: Feature[] = [];

  /**
   * Feature store
   */
  @Input() store: FeatureStore;

  /**
   * Transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Group index
   */
  @Input() groupIndex: number;

  /**
   * Process data before submit
   */
  @Input() processData: (data: Partial<Feature>) => EditionResult | Observable<EditionResult>;

  /**
   * Generate an operation title
   */
  @Input() getOperationTitle: (data: Feature, languageService: LanguageService) => string;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<Feature[]>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.baseFeature$.next(this.computeBaseFeature());
  }

  ngOnDestroy() {
    if (this.result$$ !== undefined) {
      this.result$$.unsubscribe();
    }
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  /**
   * Batch update the features properties then,
   * do any additional processing of these features (optional).
   * @param data Feature data
   * @internal
   */
  onSubmit(data: Partial<Feature>) {
    const features = this.updateFeatures(data);
    const results$ = [];
    if (typeof this.processData === 'function') {
      features.forEach((feature: Feature) => {
        const resultOrObservable = this.processData(feature);
        if (resultOrObservable instanceof Observable) {
          results$.push(resultOrObservable);
        } else {
          results$.push(of(resultOrObservable));
        }
      });
      this.result$$ = zip(...results$).subscribe((results: EditionResult[]) => {
        this.submitResults(results.filter((result: EditionResult) => result !== undefined));
      });
    } else {
      const results = features.map((feature: Feature) => ({feature}));
      this.submitResults(results);
    }
  }

  /**
   * Emit the cancel event
   * @internal
   */
  onCancel() {
    this.cancel.emit();
  }

  /**
   * Display  an error message, if any
   * @param results Edition results
   */
  private submitResults(results: EditionResult[]) {
    this.result$$ = undefined;

    const firstResultWithError = results.find((result: EditionResult) => result.error !== undefined);
    const error = firstResultWithError === undefined ? undefined : firstResultWithError.error;
    this.setError(error);

    if (error === undefined) {
      this.onSubmitSuccess(results.map((result: EditionResult) => result.feature));
    }
  }

  /**
   * Add the updated features to the transaction and emit the complete event
   * @param featurs Features
   */
  private onSubmitSuccess(features: Feature[]) {
    if (this.transaction !== undefined && this.store !== undefined) {
      this.addToTransaction(features);
    }
    this.complete.emit(features);
  }

  /**
   * Add the updated features to the transaction
   * @param feature Feature
   */
  private addToTransaction(features: Feature[]) {
    const getOperationTitle = this.getOperationTitle ? this.getOperationTitle : getDefaultOperationTitle;

    features.forEach((feature: Feature) => {
      const previous = this.features.find((_feature: Feature) => {
        return this.store.getKey(_feature) === this.store.getKey(feature);
      });
      this.transaction.update(previous, feature, this.store, {
        title: getOperationTitle(feature, this.languageService)
      });
    });
  }

  /**
   * Update features
   * @param feature Feature
   */
  private updateFeatures(data: Partial<Feature>): Feature[] {
    return this.features.map((feature: Feature) => {
      const properties = Object.assign({}, feature.properties, data.properties);
      const meta = Object.assign({}, feature.meta, data.meta, {
        revision: getEntityRevision(feature) + 1
      });
      return Object.assign({}, feature, {properties, meta});
    });
  }

  /**
   * Compute the base feature to work with. The properties that share
   * the same value accros all features will be kept. Other properties
   * will be set to undefined.
   * @returns Feature
   */
  private computeBaseFeature(): Partial<Feature> {
    const fields = getAllFormFields(this.form);
    const fieldNames = fields.map((field: FormField) => field.name);

    const keys = this.features
      .reduce((acc: string[], feature: Feature) => {
        return acc.concat(Object.keys(feature.properties));
      }, [])
      .filter((key: string) => fieldNames.includes(`properties.${key}`));
    const uniqueKeys = new Set(keys);

    const deleted = [];
    const properties = this.features.reduce((acc: {[key: string]: any}, feature: Feature) => {
      uniqueKeys.forEach((key: string) => {
        const value = feature.properties[key];
        if (!(key in acc) && !deleted.includes(key)) {
          acc[key] = value;
        } else if (acc[key] !== value) {
          delete acc[key];
          deleted.push(key);
        }
      });
      return acc;
    }, {});

    return {
      type: FEATURE,
      properties,
      geometry: undefined
    };
  }

  private setError(text: string | undefined) {
    if (text === undefined) {
      this.message$.next(undefined);
    } else {
      this.message$.next({
        type: MessageType.ERROR,
        text: text
      });
    }
  }

}
