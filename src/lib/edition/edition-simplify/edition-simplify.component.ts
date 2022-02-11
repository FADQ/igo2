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

import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';

import {
  EntityTransaction,
  WidgetComponent,
  OnUpdateInputs
} from '@igo2/common';
import { LanguageService, Message, MessageType } from '@igo2/core';
import {
  IgoMap,
  VectorLayer,
  Feature,
  FeatureStore,
  FeatureDataSource,
  FeatureStoreLoadingStrategy,
  FeatureMotion
} from '@igo2/geo';

import { EditionResult } from '../shared/edition.interfaces';
import {
  createOlEditionStyle,
  getOperationTitle as getDefaultOperationTitle,
  simplifyFeature
} from '../shared/edition.utils';

@Component({
  selector: 'fadq-edition-simplify',
  templateUrl: './edition-simplify.component.html',
  styleUrls: ['./edition-simplify.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionSimplifyComponent implements OnUpdateInputs, WidgetComponent, OnInit, OnDestroy {

  /**
   * Simplify store
   * @internal
   */
  simplifyStore: FeatureStore;

  /**
   * Message
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Wether the submit button is enabled
   * @internal
   */
  readonly submitEnabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Subscription to the processData function
   */
  private result$$: Subscription;

  /**
   * Map to simplify feature on
   */
  @Input() map: IgoMap;

  /**
   * Optional title
   */
  @Input() title: string;

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

  /**
   * Tolerance, in meters
   */
  get tolerance(): number { return this.tolerance$.value; }
  set tolerance(value: number) { this.tolerance$.next(value); }
  readonly tolerance$: BehaviorSubject<number> = new BehaviorSubject(0);

  private tolerance$$: Subscription;

  constructor(
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

   /**
   * Create the simplify layer store and add it to the map
   * @internal
   */
  ngOnInit() {
    this.simplifyStore = this.createSimplifyStore();
    this.map.ol.addLayer(this.simplifyStore.layer.ol);

    this.tolerance$$ = this.tolerance$.pipe(
      skip(1),
      debounceTime(200)
    ).subscribe(() => this.simplify());
  }

  /**
   * Remove the simplify layer from the map
   * @internal
   */
  ngOnDestroy() {
    this.teardown();
    this.tolerance$$.unsubscribe();
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  /**
   * Simplify the base feature but don't add it to the transaction
   * @internal
   */
  simplify() {
    const getKey = this.simplifyStore.getKey;
    const baseFeature = this.simplifyStore.get(getKey(this.feature));
    baseFeature.geometry = this.feature.geometry;

    const tolerance = this.computeTolerance();
    const feature = simplifyFeature(baseFeature, tolerance);
    this.simplifyStore.load([feature]);
    this.submitEnabled$.next(true);
  }

   /**
   * Simplify the base feature and add it to the transaction
   * @internal
   */
  onSubmit() {
    const tolerance = this.computeTolerance();
    const feature = simplifyFeature(this.feature, tolerance);
    if (typeof this.processData === 'function') {
      const resultOrObservable = this.processData(feature);
      if (resultOrObservable instanceof Observable) {
        this.result$$ = resultOrObservable.subscribe((result: EditionResult) => {
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

  /**
   * Compute the tolerance in PESG:4326 units (degrees)
   * @returns Tolerance
   */
  private computeTolerance() {
    // This in an approximation at latitude if 45 degrees
    const metersPerUnit = 7871000;
    return this.tolerance / metersPerUnit;
  }

  private teardown() {
    if (this.result$$ !== undefined) {
      this.result$$.unsubscribe();
      this.result$$ = undefined;
    }

    this.simplifyStore.clear();
  }

  /**
   * Display  an error message, if any
   * @param result Edition result
   */
  private submitResult(result: EditionResult) {
    this.result$$ = undefined;

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
   * Create an simplify store with selection capabilities
   * and load the base feature's simplifys into it.
   * @returns Simplify store
   */
  private createSimplifyStore(): FeatureStore {
    const getKey = (simplify: Feature) => simplify.properties.id;
    const simplifyStore = new FeatureStore([], {
      map: this.map,
      getKey
    });

    const layer = new VectorLayer({
      zIndex: 500,
      source: new FeatureDataSource(),
      style: createOlEditionStyle()
    });
    simplifyStore.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingStrategy({
      getFeatureId: getKey,
      motion: FeatureMotion.None
    });
    simplifyStore.addStrategy(loadingStrategy, true);
    simplifyStore.load([this.feature]);

    return simplifyStore;
  }

}
