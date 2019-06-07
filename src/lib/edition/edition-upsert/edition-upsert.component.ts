import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import {
  EntityTransaction,
  Form,
  WidgetComponent,
  OnUpdateInputs
} from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { Feature, FeatureStore } from '@igo2/geo';

import { EditionResult } from '../shared/edition.interfaces';
import { getOperationTitle as getDefaultOperationTitle } from '../shared/edition.utils';

@Component({
  selector: 'fadq-edition-upsert',
  templateUrl: './edition-upsert.component.html',
  styleUrls: ['./edition-upsert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionUpsertComponent implements  OnUpdateInputs, WidgetComponent {

  /**
   * Error message, if any
   * @internal
   */
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * Create form
   */
  @Input() form: Form;

  /**
   * Base feature, if any (for example when updating an existing feature)
   */
  @Input() feature: Feature;

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
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit(data: Feature) {
    if (typeof this.processData === 'function') {
      const resultOrObservable = this.processData(data);
      if (resultOrObservable instanceof Observable) {
        resultOrObservable.subscribe((result: EditionResult) => {
          this.submitResult(result);
        });
      } else {
        this.submitResult(resultOrObservable);
      }
    } else {
      this.submitResult({feature: data as Feature});
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

    if (this.feature === undefined) {
      this.transaction.insert(feature, this.store, {
        title: operationTitle
      });
    } else {
      this.transaction.update(this.feature, feature, this.store, {
        title: operationTitle
      });
    }
  }

}
