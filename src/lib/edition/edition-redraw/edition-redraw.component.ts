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

import {
  EntityRecord,
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

@Component({
  selector: 'fadq-edition-redraw',
  templateUrl: './edition-redraw.component.html',
  styleUrls: ['./edition-redraw.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionRedrawComponent implements
    OnInit, OnDestroy, OnUpdateInputs, WidgetComponent {

  /**
   * Message
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Whether the apply buttons should be disabled
   * @internal
   */
  readonly applyDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  /**
   * Feature being redrawn
   * @internal
   */
  set feature(value: Feature | undefined) { this.feature$.next(value); }
  get feature(): Feature | undefined { return this.feature$.value; }
  readonly feature$: BehaviorSubject<Feature> = new BehaviorSubject(undefined);

  /**
   * Subscription to the geometry changes event
   */
  private geometry$$: Subscription;

  /**
   * Subscription to the processData function
   */
  private result$$: Subscription;

  /**
   * Subscription to the selected feature
   */
  private selectedFeature$$: Subscription;

  /**
   * Selection strategy
   */
  private selectionStrategy: FeatureStoreSelectionStrategy;

  /**
   * Wheter the selection strategy is active initally
   */
  private selectionStrategyIsActive: boolean;

  /**
   * Selected Ol feature
   */
  private selectedOlFeature: OlFeature<OlSimpleGeometry>;

  /**
   * Selected Ol feature styl. Keep a ref to it to restore it on complete
   */
  private selectedOlFeatureStyle: OlStyle;

  /**
   * OL overlay
   */
  private olButtonOverlay: OlOverlay;

  /**
   * Subscription to the form status
   */
  private formStatusChanges$$: Subscription;

  /**
   * Create form
   */
  @Input() form: Form;

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
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.formStatusChanges$$ = this.form.control.statusChanges.subscribe(() => {
      this.applyDisabled$.next(!this.form.control.valid);
    });

    const selectionStrategy = this.store.getStrategyOfType(FeatureStoreSelectionStrategy);
    this.selectionStrategy = selectionStrategy as FeatureStoreSelectionStrategy;
    this.selectionStrategyIsActive = this.selectionStrategy.active;
    this.activateSelection();
    this.observeSelectedFeature();
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
    this.result$$ = this.featureToResult(data).subscribe((result: EditionResult) => {
      this.submitResult(result);
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

    this.formStatusChanges$$.unsubscribe();

    this.showSelectedFeature();
    this.unobserveSelectedFeature();
    this.unobserveGeometry();
    this.clearOlOverlay();

    if (this.selectionStrategyIsActive === true) {
      this.activateSelection();
    } else {
      this.deactivateSelection();
    }
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
    this.complete.emit(feature);
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
      // This is needed because this.feature is a clone of the
      // original feature, without geometry. We want the whole feature
      const featureId = this.store.getKey(this.feature);
      this.transaction.update(this.store.get(featureId), feature, this.store, {
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

  private activateSelection() {
    this.selectionStrategy.activate();
  }

  private deactivateSelection() {
    this.selectionStrategy.deactivate();
    this.hideSelectedFeature();
  }

  private observeSelectedFeature() {
    this.selectedOlFeature = undefined;
    this.unobserveSelectedFeature();
    this.unselectAllFeatures();

    this.selectedFeature$$ = this.store.stateView
      .firstBy$((record: EntityRecord<Feature>) => record.state.selected === true)
      .subscribe((record: EntityRecord<Feature>) => {
        const feature = record ? record.entity : undefined;
        if (feature !== undefined) {
          this.onSelectFeature(feature);
        }
      });
  }

  private unobserveSelectedFeature() {
    if (this.selectedFeature$$ !== undefined) {
      this.selectedFeature$$.unsubscribe();
      this.selectedFeature$$ = undefined;
    }
  }

  private onSelectFeature(feature: Feature) {
    this.unobserveSelectedFeature();
    this.selectedOlFeature = this.getSelectedOlFeature(feature);
    this.deactivateSelection();
    this.unselectAllFeatures();
    this.setFeature(feature);
  }

  private setFeature(feature: Feature | undefined) {
    const properties = Object.assign({}, feature.properties);
    const clone = Object.assign({}, feature, {
      properties,
      geometry: undefined
    });
    this.feature$.next(clone);
    this.observeGeometry();
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

  private unselectAllFeatures() {
    this.store.state.updateAll({selected: false});
    this.selectionStrategy.clear();
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

      this.feature$.next(undefined);
      this.activateSelection();
      this.observeSelectedFeature();
    });
  }

  /**
   * Return the Ol feature of the selected feature
   */
  private getSelectedOlFeature(feature: Feature): OlFeature<OlSimpleGeometry> | undefined {
    const featureId = this.store.getKey(feature);
    return this.store.layer.dataSource.ol.getFeatureById(featureId);
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

}
