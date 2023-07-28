import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  ViewChild
} from '@angular/core';

import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';

import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlPolygon from 'ol/geom/Polygon';
import OlSimpleGeometry from 'ol/geom/SimpleGeometry';
import OlOverlay from 'ol/Overlay';
import OlFeature from 'ol/Feature';
import { Style as OlStyle } from 'ol/style';
import { StyleLike as OlStyleLike } from 'ol/style/Style';

import turfTruncate from '@turf/truncate';

import {
  EntityTransaction,
  Form,
  FormField,
  getAllFormFields,
  WidgetComponent,
  OnUpdateInputs
} from '@igo2/common';
import { LanguageService, Message, MessageType } from '@igo2/core';
import {
  Feature,
  FeatureFormComponent,
  FeatureStore,
  FeatureStoreSelectionStrategy,
  GeoJSONGeometry,
  GeometryFormFieldInputs
} from '@igo2/geo';

import { EditionResult } from '../shared/edition.interfaces';
import { getOperationTitle as getDefaultOperationTitle } from '../shared/edition.utils';

import { EditionService } from '../shared/edition.service';

@Component({
  selector: 'fadq-edition-upsert',
  templateUrl: './edition-upsert.component.html',
  styleUrls: ['./edition-upsert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionUpsertComponent implements OnInit, OnDestroy, OnUpdateInputs, WidgetComponent {

  /**
   * Message
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Subscription to the geometry changes event
   */
  private geometry$$: Subscription;

  /**
   * Subscription to the processData function
   */
  private result$$: Subscription;

  /**
   * Selected Ol feature
   */
  private selectedOlFeature: OlFeature<OlSimpleGeometry>;

  /**
   * Selected Ol feature styl. Keep a ref to it to restore it on complete
   */
  private selectedOlFeatureStyle: OlStyleLike;

  /**
   * OL overlay
   */
  private olButtonOverlay: OlOverlay;

  /**
   * Create form
   */
  @Input() form: Form;

  /**
   * Base feature, if any (for example when updating an existing feature)
   */
  @Input()
  set feature(value: Feature | undefined) { this.feature$.next(value); }
  get feature(): Feature | undefined { return this.feature$.value; }
  readonly feature$: BehaviorSubject<Feature> = new BehaviorSubject(undefined);

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
   * Wheter a button should be added to the map after draw complete
   */
  @Input() addContinueButton: boolean = false;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<Feature>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('featureForm') featureForm: FeatureFormComponent;

  constructor(
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef,
    private editionService: EditionService
  ) {}

  ngOnInit() {
    this.selectedOlFeature = this.getSelectedOlFeature();
    if (this.selectedOlFeature !== undefined) {
      this.selectedOlFeatureStyle = this.selectedOlFeature.getStyle();
      this.hideSelectedFeature();
    }

    if (this.addContinueButton) {
      this.observeGeometry();
    }
  }

  /**
   * Show the selected feature
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
   * Do any additional processing of the new or updated feature (optional).
   * @param data Feature data
   * @internal
   */
  onSubmit(data: Feature) {

    let truncFeature = data;
    if (this.feature === undefined || this.feature.geometry !== data.geometry) {
      // truncate data precision an keep 2d coordinates only
      const options = {precision: 6, coordinates: 2};
      truncFeature.geometry = turfTruncate(data.geometry,options);
    }

    // validate geometry
    this.result$$ = this.featureToResult(truncFeature).subscribe((result: EditionResult) => {
      this.editionService.validateGeometry(truncFeature)
        .subscribe((message: string) => {
          result.error = message;
          this.submitResult(result);
      });
    });
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

    this.showSelectedFeature();
    this.clearOlOverlay();
    this.unobserveGeometry();
  }

  private featureToResult(data: Feature): Observable<EditionResult> {
    if (typeof this.processData === 'function') {
      const resultOrObservable = this.processData(data);
      if (resultOrObservable instanceof Observable) {
        return resultOrObservable;
      } else {
        return of(resultOrObservable);
      }
    }

    return of({feature: data as Feature});
  }

  /**
   * Display  an error message, if any
   * @param results Edition results
   */
  private submitResult(result: EditionResult) {
    this.result$$ = undefined;

    const error = result.error;
    this.setError(error);

    if (error === undefined) {
      this.onSubmitSuccess(result.feature);
    }
  }

  /**
   * Add the new or updated to the transaction and emit the complete event
   * @param feature Features
   */
  private onSubmitSuccess(feature: Feature) {
    if (this.transaction !== undefined && this.store !== undefined) {
      this.addToTransaction(feature);
    }
    this.showSelectedFeature();
    this.complete.emit(feature);
    //this.form.control.reset();
  }

  /**
   * Add the new or updated feature to the transaction
   * @param feature Feature
   */
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

  private getSelectedOlFeature(): OlFeature<OlSimpleGeometry> | undefined {
    if (this.feature === undefined) {
      return;
    }

    const selectionStrategy =
      this.store.getStrategyOfType(FeatureStoreSelectionStrategy) as FeatureStoreSelectionStrategy;
    if (selectionStrategy === undefined) {
      return;
    }

    const overlayStore = selectionStrategy.overlayStore;
    const featureId = this.store.getKey(this.feature);

    return overlayStore.source.ol.getFeatureById(featureId) as OlFeature<OlSimpleGeometry>;
  }

  /**
   * Deactivate feature selection from the store and from the map
   */
  private showSelectedFeature() {
    const olFeature = this.selectedOlFeature;
    if (olFeature !== undefined) {
      const olStyle = this.selectedOlFeatureStyle || undefined;
      olFeature.setStyle(olStyle);
    }
  }

  /**
   * Deactivate feature selection from the store and from the map
   */
  private hideSelectedFeature() {
    const olFeature = this.selectedOlFeature;
    if (olFeature !== undefined) {
      olFeature.setStyle(new OlStyle(null));
    }
  }

  private observeGeometry() {
    const geometryField = this.getGeometryField();
    this.geometry$$ = geometryField.control.valueChanges
      .subscribe((geometry: GeoJSONGeometry) => this.onGeometryChanges(geometry));
  }

  private unobserveGeometry() {
    if (this.geometry$$ !== undefined) {
      this.geometry$$.unsubscribe();
      this.geometry$$ = undefined;
    }
  }

  private getGeometryField(): FormField<GeometryFormFieldInputs> {
    const fields = getAllFormFields(this.form);
    return fields.find((field: FormField) => {
      return field.name === 'geometry';
    }) as FormField<GeometryFormFieldInputs>;
  }

  private onGeometryChanges(geometry: GeoJSONGeometry): OlOverlay {
    if (!geometry) {
      return;
    }

    this.unobserveGeometry();
    this.olButtonOverlay = this.addContinueButtonAtGeometry(geometry);
  }

  private clearOlOverlay() {
    if (this.olButtonOverlay !== undefined) {
      this.store.map.ol.removeOverlay(this.olButtonOverlay);
      this.olButtonOverlay = undefined;
    }
  }

  private addContinueButtonAtGeometry(geometry: GeoJSONGeometry) {
    const map = this.store.map;
    const olFormat = new OlFormatGeoJSON();
    const olGeometry = olFormat.readGeometry(geometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: map.projection
    });

    let coordinate;
    if (olGeometry instanceof OlPolygon) {
      coordinate = olGeometry.getFlatCoordinates().slice(-4, -2);
    } else if (olGeometry instanceof OlSimpleGeometry){
      coordinate = olGeometry.getFlatCoordinates().slice(-2);
    } else {
      throw new Error('Cannot add continue button for that geometry type.');
    }

    const olOverlay = new OlOverlay({
      element: this.createContinueButtonElement(),
      offset: [10, -20],
      stopEvent: true,
      className: 'fadq-edition-continue-button-overlay',
      position: coordinate
    });
    map.ol.addOverlay(olOverlay);

    return olOverlay;
  }

  private createContinueButtonElement(): HTMLElement {
    const button = document.createElement('button');
    button.innerHTML = '+';
    button.className = 'mat-icon-button';
    button.addEventListener('click', () => {
      this.onCompleteButtonClick();
    });

    return button;
  }

  private onCompleteButtonClick() {
    this.clearOlOverlay();
    if (this.addContinueButton === false) {
      return;
    }

    const data = this.featureForm.getData() as Feature;
    this.result$$ = this.featureToResult(data).subscribe((result: EditionResult) => {
      this.result$$ = undefined;

      const error = result.error;
      this.setError(error);

      if (error !== undefined) {
        return;
      }

      if (this.transaction !== undefined && this.store !== undefined) {
        this.addToTransaction(result.feature);
      }

      this.unobserveGeometry();
      this.form.control.reset();
      this.feature$.next(undefined);
      this.observeGeometry();
    });
  }

}
