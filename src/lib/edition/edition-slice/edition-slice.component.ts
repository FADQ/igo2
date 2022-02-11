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

import { Subscription, BehaviorSubject, Observable, of, zip } from 'rxjs';

import OlFeature from 'ol/Feature';
import OlGeometry from 'ol/geom/Geometry';
import OlPolygon from 'ol/geom/Polygon';
import OlGeoJSON from 'ol/format/GeoJSON';

import {
  EntityTransaction,
  WidgetComponent,
  OnUpdateInputs,
  getEntityRevision
} from '@igo2/common';
import { LanguageService, Message, MessageType } from '@igo2/core';
import {
  Feature,
  FeatureStore,
  IgoMap,
  SliceControl,
  GeometrySliceError,
  GeometrySliceMultiPolygonError,
  GeometrySliceLineStringError,
  GeometrySliceTooManyIntersectionError,
  measureOlGeometryArea
} from '@igo2/geo';
import { uuid } from '@igo2/utils';

import { EditionResult } from '../shared/edition.interfaces';
import {
  createOlEditionStyle,
  getOperationTitle as getDefaultOperationTitle
} from '../shared/edition.utils';

@Component({
  selector: 'fadq-edition-slice',
  templateUrl: './edition-slice.component.html',
  styleUrls: ['./edition-slice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionSliceComponent implements  OnUpdateInputs, WidgetComponent, OnInit, OnDestroy {

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
   * Subscription to the processData function
   */
  private result$$: Subscription;

  /**
   * Slice control
   */
  private sliceControl: SliceControl;

  /**
   * Subscription to slice end
   */
  private sliceEnd$$: Subscription;

  /**
   * Subscription to slice error
   */
  private sliceError$$: Subscription;

  /**
   * Error classes -> i18n key mapping
   */
  private errorMessages = new Map([
    [GeometrySliceMultiPolygonError, 'geometry.slice.error.multiPolygon'],
    [GeometrySliceLineStringError, 'geometry.slice.error.lineString'],
    [GeometrySliceTooManyIntersectionError, 'geometry.slice.error.tooManyIntersection']
  ]);

  /**
   * Optional title
   */
  @Input() title: string;

  /**
   * Map to draw features on
   */
  @Input() map: IgoMap;

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
  @Output() complete = new EventEmitter<Feature[]>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * Add the draw line control
   * @internal
   */
  ngOnInit() {
    this.createSliceControl();
    this.activateSliceControl();
  }

  /**
   * Remove the draw line control
   * @internal
   */
  ngOnDestroy() {
    this.teardown();
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

   /**
   * Slice the base feature into multiple features and
   * do any additional processing on them (optional).
   * @internal
   */
  onSubmit() {
    const features = this.computeFeatures();
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
    this.teardown();
    this.cancel.emit();
  }

  private teardown() {
    this.removeSliceControl();
    if (this.result$$ !== undefined) {
      this.result$$.unsubscribe();
      this.result$$ = undefined;
    }
  }

  /**
   * Display  an error message, if any
   * @param result Edition result
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
   * Remove the base feature from the transaction, add the new ones
   * and emit the complete event
   * @param feature Feature
   */
  private onSubmitSuccess(features: Feature[]) {
    this.submitEnabled$.next(false);
    if (this.transaction !== undefined && this.store !== undefined) {
      this.addToTransaction(features);
    }
    this.deactivateSliceControl();
    this.complete.emit(features);
  }

  private addToTransaction(features: Feature[]) {
    const getOperationTitle = this.getOperationTitle ? this.getOperationTitle : getDefaultOperationTitle;

    const measureProjection = 'EPSG:32198';
    let maxArea = 0;
    let baseFeature: Feature;

    // Find the bighest area feature
    features.forEach((feature: Feature) => {
      let tempArea = 0;
      const olGeometry = new OlGeoJSON().readGeometry(feature.geometry, {
        dataProjection: feature.projection,
        featureProjection: measureProjection
      });
      tempArea = measureOlGeometryArea(olGeometry as OlPolygon, measureProjection);
      if (tempArea > maxArea) {
        maxArea = tempArea;
        baseFeature = feature;
      }
    });

    // Update geometry of sliced feature to the base feature geometry
    const properties = this.feature.properties;
    const meta = Object.assign({}, this.feature.meta, {
      revision: getEntityRevision(this.feature) + 1
    });
    const featureUpdate = Object.assign(this.feature, {
      meta,
      projection: 'EPSG:4326',
      properties
    });
    featureUpdate.geometry = baseFeature.geometry;

    this.transaction.update(this.feature, featureUpdate, this.store, {
      title: getOperationTitle(this.feature, this.languageService)
    });
    features.forEach((feature: Feature) => {
      if (feature !== baseFeature) {
        this.transaction.insert(feature, this.store, {
        title: getOperationTitle(feature, this.languageService)
      });
    }
    });
  }

  /**
   * Create a draw line control
   */
  private createSliceControl() {
    this.sliceControl = new SliceControl({
      layerStyle: createOlEditionStyle()
    });
  }

  /**
   * Activate the slice control
   */
  private activateSliceControl() {
    this.sliceEnd$$ = this.sliceControl.end$
      .subscribe((olGeometries: OlGeometry[]) => this.onSliceEnd(olGeometries));
    this.sliceError$$ = this.sliceControl.error$
      .subscribe((error: GeometrySliceError) => this.onSliceError(error));

    const olGeometry = new OlGeoJSON().readGeometry(this.feature.geometry, {
      dataProjection: this.feature.projection,
      featureProjection: this.map.projection
    });

    this.sliceControl.setOlGeometry(olGeometry);
    this.sliceControl.setOlMap(this.map.ol);
  }

  /**
   * Deactivate the active draw control
   */
  private deactivateSliceControl() {
    this.sliceEnd$$.unsubscribe();
    this.sliceError$$.unsubscribe();
    this.sliceControl.setOlMap(undefined);
  }

  /**
   * Remove draw line control
   */
  private removeSliceControl() {
    this.deactivateSliceControl();
    this.sliceControl.getSource().clear();
  }

  /**
   * On slice end, enable the submit button
   */
  private onSliceEnd(olGeometries: OlGeometry[]) {
    if (olGeometries.length > 0) {
      this.submitEnabled$.next(true);
    }
  }

  /**
   * On slice error, display a nice, translated message, or display
   * the error's default message.
   * @param error Slice error object
   */
  private onSliceError(error: GeometrySliceError) {
    if (error === undefined) {
      this.setError(undefined);
      return;
    }

    let text = error.message;

    // We need to use instanceof instead of directly accessing the map with the error's prototype
    // because GeometrySliceError all share the same GeometrySliceError
    const key = Array.from(this.errorMessages.keys()).find((cls: typeof GeometrySliceError) => {
      return error instanceof cls;
    });
    const textKey = this.errorMessages.get(key);

    try {
      text = this.languageService.translate.instant(textKey);
    } catch (e) {}
    this.setError(text);
  }

  /**
   * Compute the sliced features
   * @returns Features
   */
  private computeFeatures(): Feature[] {
    const olFeatures = this.sliceControl.getSource().getFeatures();
    if (olFeatures.length <= 1) {
      return [];
    }

    const olGeoJSON = new OlGeoJSON();
    const baseFeature = this.feature;
    return olFeatures.map((olFeature: OlFeature<OlPolygon>): Feature => {
      const olGeometry = olFeature.getGeometry();
      const meta = Object.assign({}, baseFeature.meta, {
        id: uuid()
      });
      const properties = Object.assign({}, baseFeature.properties);

      return Object.assign({}, baseFeature, {
        meta,
        properties,
        geometry: olGeoJSON.writeGeometryObject(olGeometry, {
          dataProjection: baseFeature.projection,
          featureProjection: this.map.projection
        })
      });
    });
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
