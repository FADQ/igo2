import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';

import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { LanguageService, Message, MessageType } from '@igo2/core';
import {
  EntityRecord,
  EntityTransaction,
  Form,
  FormField,
  FormFieldSelectInputs,
  getAllFormFields,
  FormFieldSelectChoice
} from '@igo2/common';
import {
  FeatureDataSource,
  FeatureStore,
  FeatureStoreSelectionStrategy,
  VectorLayer
} from '@igo2/geo';

import { EditionResult } from '../../../edition/shared/edition.interfaces';

import {
  ClientParcelPro,
  ClientParcelProProduction
} from '../shared/client-parcel-pro.interfaces';
import { ClientParcelProService } from '../shared/client-parcel-pro.service';
import { ClientParcelProFormService } from '../shared/client-parcel-pro-form.service';

import {
  generateParcelProOperationTitle,
} from '../shared/client-parcel-pro.utils';

@Component({
  selector: 'fadq-client-parcel-pro-wizard-step-1',
  templateUrl: './client-parcel-pro-wizard-step-1.component.html',
  styleUrls: ['./client-parcel-pro-wizard-step-1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelProWizardComponentStep1 implements OnInit {

  /**
   * The form
   * @internal
   */
  readonly form$ = new BehaviorSubject<Form>(undefined);

  /**
   * Parcel pros to edit
   */
  readonly selected$: BehaviorSubject<ClientParcelPro[]> = new BehaviorSubject([]);

  /**
   * Message informing the user to that he needs to select parcels.
   * @internal
   */
  readonly infoMessage$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Number of selected parcels
   * @internal
   */
  readonly selectionMessage$: Observable<Message> = this.selected$.pipe(
    concatMap((parcelPros: ClientParcelPro[]) => {
      const textKey = 'client.parcelPro.edit.selected';
      const text = this.languageService.translate.instant(textKey, {
        count: parcelPros.length
      });
      return of({
        type: MessageType.INFO,
        text
      });
    })
  );

  /**
   * Wether the selection confirmation button is enabled
   * @internal
   */
  readonly confirmSelectionEnabled$:  Observable<boolean> = this.selected$.pipe(
    concatMap((parcelPros: ClientParcelPro[]) => {
     return of(parcelPros.length > 0);
    })
  );

  /**
   * Wether the parcel selection has been confirmed
   * @internal
   */
  readonly selectionConfirmed$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Selection strategy
   */
  private selectionStrategy: FeatureStoreSelectionStrategy;

  /**
   * Wheter the selection strategy is active initally
   */
  private selectionStrategyIsActive: boolean;

  /**
   * Subscription
   */
  private selected$$: Subscription;

  /**
   * Subscription
   */
  private category$$: Subscription;

  /**
   * Subscription
   */
  private production$$: Subscription;

  /**
   * Layer that shows selected parcels
   */
  private overlayLayer: VectorLayer;

  get getOperationTitle(): (data: ClientParcelPro, languageService: LanguageService) => string  {
    return generateParcelProOperationTitle;
  }

  get processData(): (data: ClientParcelPro) => Observable<EditionResult>  {
    return (data: ClientParcelPro): Observable<EditionResult> => this.processParcelPro(data);
  }

  /**
   * Parcel pro store
   */
  @Input() store: FeatureStore<ClientParcelPro>;

  /**
   * Parcel pro transaction
   */
  @Input() transaction: EntityTransaction;

  constructor(
    private clientParcelProService: ClientParcelProService,
    private clientParcelProFormService: ClientParcelProFormService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.overlayLayer = this.createOverlayLayer();
    this.store.map.addLayer(this.overlayLayer);
  
    const selectionStrategy = this.store.getStrategyOfType(FeatureStoreSelectionStrategy);
    this.selectionStrategy = selectionStrategy as FeatureStoreSelectionStrategy;
    this.selectionStrategyIsActive = this.selectionStrategy.active;

    this.enableSelection();

    this.clientParcelProFormService
      .buildUpdateBatchForm()
      .subscribe((form: Form) => this.setForm(form));
  }

  ngOnDestroy() {
    this.teardown();
  }

  onConfirmSelection() {
    this.setSelectionConfirmed(true);
  }

  onComplete() {
    this.reset();
  }

  onCancel() {
    this.reset();
  }

  private createOverlayLayer(): VectorLayer {
    return new VectorLayer({
      zIndex: 300,
      source: new FeatureDataSource(),
      style: undefined,
      showInLayerList: false,
      exportable: false,
      browsable: false
    });
  }

  private setSelectionConfirmed(confirmed: boolean) {
    if (confirmed) {
      this.disableSelection();
    } else {
      this.enableSelection();
    }
    this.selectionConfirmed$.next(confirmed);
  }

  private reset() {
    this.selectionStrategy.unselectAll();
    this.setSelectionConfirmed(false);
  }

  private teardown() {
    this.store.map.removeLayer(this.overlayLayer);
  
    if (this.selected$$ !== undefined) {
      this.selected$$.unsubscribe();
    }

    if (this.category$$ !== undefined) {
      this.category$$.unsubscribe();
    }

    if (this.production$$ !== undefined) {
      this.production$$.unsubscribe();
    }

    if (this.selectionStrategy.active !== this.selectionStrategyIsActive) {
      if (this.selectionStrategyIsActive === true) {
        this.selectionStrategy.activate();
      } else {
        this.selectionStrategy.deactivate();
      }
    }
  }

  private enableSelection() {
    this.overlayLayer.dataSource.ol.clear();
    this.selectionStrategy.activate();

    const textKey = 'client.parcelPro.edit.info';
    const text = this.languageService.translate.instant(textKey);
    this.infoMessage$.next({
      type: MessageType.INFO,
      text
    });

    this.selected$$ = this.store.stateView
      .manyBy$((record: EntityRecord<ClientParcelPro>) => record.state.selected === true)
      .subscribe((records: EntityRecord<ClientParcelPro>[]) => {
        const selected = records.map((record: EntityRecord<ClientParcelPro>) => record.entity);
        this.selectParcels(selected);
      });
  }

  private disableSelection() {
    const olFeatures = this.selectionStrategy.overlayStore.source.ol.getFeatures();
    this.overlayLayer.dataSource.ol.addFeatures(olFeatures);

    this.selectionStrategy.deactivate();

    this.infoMessage$.next(undefined);
    if (this.selected$$ !== undefined) {
      this.selected$$.unsubscribe();
    }
  }

  private selectParcels(parcels: ClientParcelPro[]) {
    this.selected$.next(parcels);
  }

  private setForm(form: Form) {
    this.form$.next(form);

    const categoryField = this.getCategoryField();
    this.category$$ = categoryField.control.valueChanges
      .subscribe((category: string) => this.updateProductionChoices(category));

    const productionField = this.getProductionField();
    this.production$$ = productionField.control.valueChanges
      .subscribe((production: string) => this.updateCultivarChoices(production));
  }

  private getCategoryField(): FormField<FormFieldSelectInputs> {
    const fields = getAllFormFields(this.form$.value);
    return fields.find((field: FormField) => {
      return field.name === 'properties.category';
    }) as FormField<FormFieldSelectInputs>;
  }

  private getProductionField(): FormField<FormFieldSelectInputs> {
    const fields = getAllFormFields(this.form$.value);
    return fields.find((field: FormField) => {
      return field.name === 'properties.production';
    }) as FormField<FormFieldSelectInputs>;
  }

  private getCultivarField(): FormField<FormFieldSelectInputs> {
    const fields = getAllFormFields(this.form$.value);
    return fields.find((field: FormField) => {
      return field.name === 'properties.cultivar';
    }) as FormField<FormFieldSelectInputs>;
  }

  private updateProductionChoices(categoryCode: string) {
    this.clientParcelProService
      .getParcelProCategoryProductions(categoryCode)
      .subscribe((productions: ClientParcelProProduction[]) => {
        const productionField = this.getProductionField();
        const choices$ = productionField.inputs.choices as BehaviorSubject<FormFieldSelectChoice[]>;
        const choices = [{value: null, title: ''}].concat(
          productions.map((production) => {
              return {value: production.code, title: production.desc};
            })
          );
        choices$.next(choices);
      });
  }

  private updateCultivarChoices(productionCode: string) {
    this.clientParcelProService
      .getParcelProProductionCultivars(productionCode)
      .subscribe((cultivars: string[]) => {
        const cultivarField = this.getCultivarField();
        const choices$ = cultivarField.inputs.choices as BehaviorSubject<FormFieldSelectChoice[]>;
        const choices = [{value: null, title: ''}].concat(
          cultivars.map((cultivar) => {
              return {value: cultivar, title: cultivar};
            })
          );
        choices$.next(choices);
      });
  }

  private processParcelPro(data: ClientParcelPro): Observable<EditionResult> {
    return this.clientParcelProService.createParcelPro(data)
      .pipe(
        map((parcelPro: ClientParcelPro): EditionResult => {
          return {
            feature: parcelPro,
            error: undefined
          };
        })
      );
  }
}
