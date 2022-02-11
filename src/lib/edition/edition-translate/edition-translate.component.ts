import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';

import { Geometry as GeoJSONGeometry } from 'geojson'
import { Subscription, BehaviorSubject, Observable } from 'rxjs';

import OlGeometry from 'ol/geom/Geometry';
import OlGeoJSON from 'ol/format/GeoJSON';

import {
  EntityTransaction,
  WidgetComponent,
  getEntityRevision
} from '@igo2/common';
import { LanguageService, Message, MessageType } from '@igo2/core';
import {
  Feature,
  FeatureStore,
  IgoMap,
  ModifyControl
} from '@igo2/geo';

import { EditionResult } from '../shared/edition.interfaces';
import {
  createOlEditionTranslateStyle,
  getOperationTitle as getDefaultOperationTitle
} from '../shared/edition.utils';

@Component({
  selector: 'fadq-edition-translate',
  templateUrl: './edition-translate.component.html',
  styleUrls: ['./edition-translate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionTranslateComponent implements  WidgetComponent, OnInit, OnDestroy {

  /**
   * Message
   * @internal
   */
  message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Subscription to the processData function
   */
  private result$$: Subscription;

  /**
   * Translate control
   */
  private modifyControl: ModifyControl;

  /**
   * Subscription to modify end
   */
  private modifyEnd$$: Subscription;

  /**
   * Translated geometry
   */
  private geometry: GeoJSONGeometry;

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
  @Output() complete = new EventEmitter<Feature>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(private languageService: LanguageService) {}

  /**
   * Add the draw line control
   * @internal
   */
  ngOnInit() {
    this.createModifyControl();
    this.activateModifyControl();
  }

  /**
   * Remove the draw line control
   * @internal
   */
  ngOnDestroy() {
    this.teardown();
  }

  /**
   * Translate the base feature.
   * @internal
   */
  onSubmit() {
    const feature = this.updateFeature();
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

  private teardown() {
    this.removeModifyControl();
    if (this.result$$ !== undefined) {
      this.result$$.unsubscribe();
      this.result$$ = undefined;
    }
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
   * Create a draw line control
   */
  private createModifyControl() {
    this.modifyControl = new ModifyControl({
      layerStyle: createOlEditionTranslateStyle(),
      modify: false
    });
  }

  /**
   * Activate the modify control
   */
  private activateModifyControl() {
    this.modifyEnd$$ = this.modifyControl.end$
      .subscribe((olGeometry: OlGeometry) => this.onTranslateEnd(olGeometry));

    const olGeometry = new OlGeoJSON().readGeometry(this.feature.geometry, {
      dataProjection: this.feature.projection,
      featureProjection: this.map.projection
    });

    this.modifyControl.setOlGeometry(olGeometry);
    this.modifyControl.setOlMap(this.map.ol);
  }

  /**
   * Deactivate the active draw control
   */
  private deactivateModifyControl() {
    this.modifyEnd$$.unsubscribe();
    this.modifyControl.setOlMap(undefined);
  }

  /**
   * Remove draw line control
   */
  private removeModifyControl() {
    this.deactivateModifyControl();
    this.modifyControl.getSource().clear();
  }

  /**
   * On modify end, enable the submit button
   */
  private onTranslateEnd(olGeometry: OlGeometry) {
    if (olGeometry === undefined) {
      return;
    }

    this.geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
      featureProjection: this.map.projection,
      dataProjection: 'EPSG:4326'
    });
  }

  /**
   * Remove the selected exclusions from the base feature
   * @returns Updated feature
   */
  private updateFeature(): Feature {
    if (this.geometry === undefined) {
      return this.feature;
    }

    const featureMeta = Object.assign({}, this.feature.meta, {
      revision: getEntityRevision(this.feature) + 1
    });
    const feature = Object.assign({}, this.feature, {
      meta: featureMeta,
      geometry: this.geometry
    });

    return feature;
  }

}
