import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { Subscription, BehaviorSubject, Observable, of, zip } from 'rxjs';

import OlFeature from 'ol/Feature';
import OlGeometry from 'ol/geom/Geometry';
import OlGeoJSON from 'ol/format/GeoJSON';

import {
  EntityTransaction,
  WidgetComponent,
  OnUpdateInputs
} from '@igo2/common';
import { LanguageService } from '@igo2/core';
import {
  Feature,
  FeatureStore,
  IgoMap,
  SliceControl,
  GeometrySliceError,
  GeometrySliceMultiPolygonError,
  GeometrySliceLineStringError,
  GeometrySliceTooManyIntersectionError
} from '@igo2/geo';
import { uuid } from '@igo2/utils';

import { EditionResult } from '../shared/edition.interfaces';
import { getOperationTitle as getDefaultOperationTitle } from '../shared/edition.utils';

@Component({
  selector: 'fadq-edition-slicer',
  templateUrl: './edition-slicer.component.html',
  styleUrls: ['./edition-slicer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionSlicerComponent implements  OnUpdateInputs, WidgetComponent {

  /**
   * Error message, if any
   * @internal
   */
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * Wether the submit button is enabled
   * @internal
   */
  submitEnabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
   * Process data before submit
   */
  @Input() getOperationTitle: (data: Feature, languageService: LanguageService) => EditionResult | Observable<EditionResult>;

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
    this.removeSliceControl();
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit(data: Feature) {
    const features = this.computeFeatures();
    const results$ = [];
    if (typeof this.processData === 'function') {
      features.forEach((feature: Feature) => {
        const resultOrObservable = this.processData(feature);
        if (resultOrObservable instanceof Observable) {
          results$.push(resultOrObservable)
        } else {
          results$.push(of(resultOrObservable))
        }
      });
      zip(...results$).subscribe((results: EditionResult[]) => {
        this.submitResults(results);
      });
    } else {
      const results = features.map((feature: Feature) => {return {feature}});
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
    this.submitEnabled$.next(false);
    if (this.transaction !== undefined && this.store !== undefined) {
      this.addToTransaction(features);  
    }
    this.deactivateSliceControl();
    this.complete.emit(features);
  }

  private addToTransaction(features: Feature[]) {
    const getOperationTitle = this.getOperationTitle ? this.getOperationTitle : getDefaultOperationTitle;
    
    this.transaction.delete(this.feature, this.store, {
      title: getOperationTitle(this.feature, this.languageService)
    });
    features.forEach((feature: Feature) => {
      this.transaction.insert(feature, this.store, {
        title: getOperationTitle(feature, this.languageService)
      });
    });
  }

  /**
   * Create a draw line control
   */
  private createSliceControl() {
    this.sliceControl = new SliceControl({});
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
      this.errorMessage$.next(undefined);
      return;
    }

    let message = error.message;

    // We need to use instanceof instead of directly accessing the map with the error's prototype
    // because GeometrySliceError all share the same GeometrySliceError
    const key = Array.from(this.errorMessages.keys()).find((cls: typeof GeometrySliceError) => {
      return error instanceof cls;
    });
    const messageKey = this.errorMessages.get(key);

    try {
      message = this.languageService.translate.instant(messageKey);
    } catch (e) {}
    this.errorMessage$.next(message);
  }

  private computeFeatures(): Feature[] {
    const olFeatures = this.sliceControl.getSource().getFeatures();
    if (olFeatures.length <= 1) {
      return [];
    }

    const olGeoJSON = new OlGeoJSON();
    const baseFeature = this.feature;
    return olFeatures.map((olFeature: OlFeature): Feature => {
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

}
