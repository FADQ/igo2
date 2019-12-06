import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  Subscription,
  of,
  zip
} from 'rxjs';

import { EntityTransaction, WidgetComponent } from '@igo2/common';
import { LanguageService, Message, MessageType } from '@igo2/core';
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

  projection: string = 'EPSG:4326';

  /**
   * File object
   * @internal
   */
  file$: BehaviorSubject<File> = new BehaviorSubject(undefined);

  /**
   * Message
   * @internal
   */
  message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

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
   * Subscription to the import service
   */
  private result$$: Subscription;

  /**
   * Optional title
   */
  @Input() title: string;

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

  /**
   * Set the proper placeholder
   * @internal
   */
  ngOnInit() {
    this.resetPlaceholder();
  }

  /**
   * Keep a reference to the selected file, update the placeholder and
   * enable the submit button.
   * @param files Selected files
   * @internal
   */
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

  /**
   * Handle the imported file like the import tool does
   * @internal
   */
  onImport() {
    const projection = this.projection || 'EPSG:4326';
    this.result$$ = this.importService.import(this.file$.value, projection)
      .subscribe(
      (features: Feature[]) => this.onImportSuccess(features),
      (error: ImportError) => this.onImportError(error)
    );
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
    if (this.result$$ !== undefined) {
      this.result$$.unsubscribe();
      this.result$$ = undefined;
    }
  }

  /**
   * Process the imported features then, submit those that are not undefined
   * @param features Imported features
   * @internal
   */
  private onImportSuccess(features: Feature[]) {
    if (features.length === 0) {
      this.onEmptyFile();
      return;
    }

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
   * Submit processed features. If any feature has an error, display it
   * and don't move forward
   * @param results Results of the processed features
   * @internal
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
   * Add features to the transaction, if any, then move the
   * map's view over them and emit the complete event.
   * @param features Features
   * @internal
   */
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

  /**
   * Add the imported and processed features to the transaction
   * @param features Features
   */
  private addToTransaction(features: Feature[]) {
    const getOperationTitle = this.getOperationTitle ? this.getOperationTitle : getDefaultOperationTitle;

    features.forEach((feature: Feature) => {
      this.transaction.insert(feature, this.store, {
        title: getOperationTitle(feature, this.languageService)
      });
    });
  }

  /**
   * On nothing to import error, display a text and clear the selected file
   */
  private onEmptyFile() {
    const textKey = 'edition.import.error.emptyFile';
    const text = this.languageService.translate.instant(textKey);
    this.setError(text);
    this.file$.next(undefined);
  }

  /**
   * On any import error, display a text and clear the selected file
   * @param error Error instance
   */
  private onImportError(error: ImportError) {
    const textKey = 'edition.import.error.invalidFile';
    const text = this.languageService.translate.instant(textKey);
    this.setError(text);
    this.file$.next(undefined);
  }

  /**
   * On nothing to import error, display a text and clear the selected file
   */
  private onNothingToImport() {
    const textKey = 'edition.import.error.nothingToImport';
    const text = this.languageService.translate.instant(textKey);
    this.setError(text);
    this.file$.next(undefined);
  }

  /**
   * Reset the file input placeholder
   */
  private resetPlaceholder() {
    const key = 'edition.import.placeholder';
    const placeholder = this.languageService.translate.instant(key);
    this.placeholder$.next(placeholder);
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
