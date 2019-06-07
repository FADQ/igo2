import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { BehaviorSubject, Observable, of, zip } from 'rxjs';

import {
  EntityTransaction,
  Form,
  WidgetComponent,
  OnUpdateInputs
} from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { FEATURE, Feature, FeatureStore } from '@igo2/geo';

import { EditionResult } from '../shared/edition.interfaces';
import { getOperationTitle as getDefaultOperationTitle } from '../shared/edition.utils';

@Component({
  selector: 'fadq-edition-update-batch',
  templateUrl: './edition-update-batch.component.html',
  styleUrls: ['./edition-update-batch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionUpdateBatchComponent implements  OnUpdateInputs, WidgetComponent, OnInit {

  /**
   * Error message, if any
   * @internal
   */
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * Error message, if any
   * @internal
   */
  baseFeature$: BehaviorSubject<Partial<Feature>> = new BehaviorSubject(undefined);

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

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

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
      zip(...results$).subscribe((results: EditionResult[]) => {
        this.submitResults(results.filter((result: EditionResult) => result !== undefined));
      });
    } else {
      const results = features.map((feature: Feature) => ({feature}));
      this.submitResults(results);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  private submitResults(results: EditionResult[]) {
    const firstResultWithError = results.find((result: EditionResult) => result.error !== undefined);
    const error = firstResultWithError === undefined ? undefined : firstResultWithError.error;
    this.errorMessage$.next(error);

    if (error === undefined) {
      this.onSubmitSuccess(results.map((result: EditionResult) => result.feature));
    }
  }

  private onSubmitSuccess(features: Feature[]) {
    if (this.transaction !== undefined && this.store !== undefined) {
      this.addToTransaction(features);
    }
    this.complete.emit(features);
  }

  private addToTransaction(features: Feature[]) {
    const getOperationTitle = this.getOperationTitle ? this.getOperationTitle : getDefaultOperationTitle;

    features.forEach((feature: Feature) => {
      this.transaction.insert(feature, this.store, {
        title: getOperationTitle(feature, this.languageService)
      });
    });
  }

  private updateFeatures(data: Partial<Feature>): Feature[] {
    return this.features.map((feature: Feature) => {
      const properties = Object.assign({}, feature.properties, data.properties);
      const meta = Object.assign({}, feature.meta, data.meta);
      return Object.assign({}, feature, {properties, meta});
    });
  }

  private computeBaseFeature(): Partial<Feature> {
    const properties = {};
    return {
      type: FEATURE,
      properties,
      geometry: undefined
    };
  }

}
