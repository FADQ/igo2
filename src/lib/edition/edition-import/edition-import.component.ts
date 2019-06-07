import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';

import { BehaviorSubject, Subject, Observable, of, zip } from 'rxjs';

import { EntityTransaction, WidgetComponent } from '@igo2/common';
import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  Feature,
  FeatureStore,
  ImportService,
  ImportError,
  featureToOl,
  moveToOlFeatures
} from '@igo2/geo';

import { EditionResult } from '../shared/edition.interfaces';
import { getOperationTitle as getDefaultOperationTitle } from '../shared/edition.utils';

@Component({
  selector: 'fadq-edition-import',
  templateUrl: './edition-import.component.html',
  styleUrls: ['./edition-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionImportComponent implements WidgetComponent, OnInit {

  projection: string;

  /**
   * File object
   * @internal
   */
  file$: BehaviorSubject<File> = new BehaviorSubject(undefined);

  /**
   * Import error, if any
   * @internal
   */
  errorMessage$: Subject<string> = new Subject();

  /**
   * Wether the submit button is enabled
   * @internal
   */
  submitEnabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * File input placeholder
   * @internal
   */
  placeholder$: BehaviorSubject<string> = new BehaviorSubject(undefined);

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
    private importService: ImportService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.resetPlaceholder();
  }

  onSelectFiles(files: File[]) {
    const file = files.length > 0 ? files[0] : undefined;
    if (file === undefined) {
      this.resetPlaceholder();
    } else {
      this.placeholder$.next(file.name);
      this.submitEnabled$.next(true);
    }
    this.file$.next(file);
  }

  onImport() {
    const projection = this.projection || 'EPSG:4326';
    this.importService.import(this.file$.value, projection)
      .subscribe(
      (features: Feature[]) => this.onImportSuccess(features),
      (error: ImportError) => this.onImportError(error)
    );
  }

  onCancel() {
    this.cancel.emit();
  }

  private onImportSuccess(features: Feature[]) {
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

  private submitResults(results: EditionResult[]) {
    const firstResultWithError = results.find((result: EditionResult) => result.error !== undefined);
    const error = firstResultWithError === undefined ? undefined : firstResultWithError.error;
    this.errorMessage$.next(error);

    if (error === undefined) {
      this.onSubmitSuccess(results.map((result: EditionResult) => result.feature));
    }
  }

  private onSubmitSuccess(features: Feature[]) {
    this.submitEnabled$.next(false);
    if (features.length === 0) {
      this.onNothingToImport();
      return;
    }

    if (this.transaction !== undefined && this.store !== undefined) {
      this.addToTransaction(features);
    }

    const olFeatures = features.map((feature: Feature) => featureToOl(feature, this.map.projection));
    moveToOlFeatures(this.map, olFeatures);

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

  private onImportError(error: ImportError) {
    const messageKey = 'edition.importData.error.invalidFile';
    const message = this.languageService.translate.instant(messageKey);
    this.errorMessage$.next(message);
    this.file$.next(undefined);
  }

  private onNothingToImport() {
    const messageKey = 'edition.importData.error.nothingToImport';
    const message = this.languageService.translate.instant(messageKey);
    this.errorMessage$.next(message);
    this.file$.next(undefined);
  }

  private resetPlaceholder() {
    const key = 'edition.importData.placeholder';
    const placeholder = this.languageService.translate.instant(key);
    this.placeholder$.next(placeholder);
  }

}
