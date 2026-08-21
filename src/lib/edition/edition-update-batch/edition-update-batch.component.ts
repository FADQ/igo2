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
  combineLatest,
  of,
  zip
} from 'rxjs';

import { EntityTransaction, getEntityRevision } from '@igo2/common/entity';
import { Form, FormField, getAllFormFields } from '@igo2/common/form';
import { WidgetComponent } from '@igo2/common/widget';
import { OnUpdateInputs } from '@igo2/common/dynamic-component';

import { LanguageService } from '@igo2/core/language';
import { Message, MessageType } from '@igo2/core/message';
import { FEATURE, Feature, FeatureStore } from '@igo2/geo';

import { EditionResult } from '../shared/edition.interfaces';
import { getOperationTitle as getDefaultOperationTitle } from '../shared/edition.utils';
import { asEntityStore } from '@lib/compatibility/igo2-compat';

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

  private form$ = new BehaviorSubject<Form | undefined>(undefined);
  private features$ = new BehaviorSubject<Feature[]>([]);

  private _form: Form;

  /**
   * Create form
   */
  get form(): Form {
    return this._form;
  }

  @Input()
  set form(value: Form) {
    this._form = value;
    this.form$.next(value);
  }

  /**
   * Base features
   */
  private _features: Feature[] = [];

  @Input()
  set features(value: Feature[]) {
    this._features = value || [];
    this.features$.next(this._features);
  }

  get features(): Feature[] {
    return this._features;
  }

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
    combineLatest([this.form$, this.features$])
    .subscribe(([form, features]) => {

      if (!form || !features.length) {
        return;
      }

      const baseFeature = this.computeBaseFeature();

      // ✅ 🔥 FIX CRITIQUE : injecter les valeurs dans le form
      const propertiesGroup = form.control.get('properties');

      if (propertiesGroup) {

        Object.keys(baseFeature.properties || {}).forEach(key => {

          const control = propertiesGroup.get(key);

          if (control) {
            control.setValue(baseFeature.properties[key], { emitEvent: false });
          }

        });

      }

      this.baseFeature$.next(baseFeature);

      this.cdRef.markForCheck();
    });

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

    const results$: Observable<EditionResult>[] = [];

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
        this.submitResults(
          results.filter((result): result is EditionResult => result !== undefined)
        );
      });

    } else {
      const results = features.map((feature: Feature) => ({ feature }));
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
      this.transaction.update(previous, feature, asEntityStore(this.store), {
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

    if (!this.form || !this.features?.length) {
      return { type: FEATURE, properties: {} };
    }

    const fields = getAllFormFields(this.form);
    const fieldNames = fields.map((field: FormField) => field.name);

    // ✅ normaliser les noms (retirer "properties.")
    const normalizedFieldNames = fieldNames.map(name =>
      name.replace('properties.', '')
    );

    // ✅ récupérer uniquement les clés utiles au form
    const keys = this.features
      .reduce((acc: string[], feature: Feature) => {
        return acc.concat(Object.keys(feature.properties));
      }, [])
      .filter((key: string) => normalizedFieldNames.includes(key));

    const uniqueKeys = Array.from(new Set(keys));

    // ✅ construire les propriétés (version robuste)
    const properties: { [key: string]: any } = {};

    this.features.forEach((feature: Feature) => {
      uniqueKeys.forEach((key: string) => {

        const currentValue = feature.properties[key];

        if (!(key in properties)) {
          // première occurrence
          properties[key] = currentValue;
        } else if (properties[key] !== currentValue) {
          // valeurs différentes → mode batch
          properties[key] = null;
        }

      });
    });

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
