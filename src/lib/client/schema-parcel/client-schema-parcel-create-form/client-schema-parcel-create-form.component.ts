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

import { BehaviorSubject, Subscription } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import {
  EntityTransaction,
  Form,
  FormField,
  FormFieldSelectInputs,
  WidgetComponent,
  OnUpdateInputs,
  FormFieldSelectChoice
} from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { Feature, FeatureStore, IgoMap, GeoJSONGeometry } from '@igo2/geo';

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElementTypes } from '../../schema-element/shared/client-schema-element.interfaces';
import { ClientSchemaElementService } from '../../schema-element/shared/client-schema-element.service';
import {
  generateOperationTitle,
  computeSchemaElementArea,
  getSchemaElementValidationMessage
} from '../../schema-element/shared/client-schema-element.utils';

import { ClientSchemaParcel } from '../shared/client-schema-parcel.interfaces';
import { ClientSchemaParcelFormService } from '../shared/client-schema-parcel-form.service';

@Component({
  selector: 'fadq-client-schema-parcel-create-form',
  templateUrl: './client-schema-parcel-create-form.component.html',
  styleUrls: ['./client-schema-parcel-create-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaParcelCreateFormComponent
    implements OnInit, OnDestroy, OnUpdateInputs, WidgetComponent {

  /**
   * Create form
   * @internal
   */
  form$ = new BehaviorSubject<Form>(undefined);

  /**
   * Create form
   * @internal
   */
  tabIndex$ = new BehaviorSubject<number>(0);

  /**
   * Slice error, if any
   * @internal
   */
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * Subscriptiuon to the value changes event
   */
  private geometry$$: Subscription;

  /**
   * Map to draw parcels on
   */
  @Input() map: IgoMap;

  /**
   * Schema parcel store
   */
  @Input() store: FeatureStore<ClientSchemaParcel>;

  /**
   * Schema parcel transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Schema
   */
  @Input() schema: ClientSchema;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private clientSchemaElementService: ClientSchemaElementService,
    private clientSchemaParcelFormService: ClientSchemaParcelFormService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clientSchemaElementService
      .getSchemaElementGeometryTypes(this.schema.type)
      .pipe(
        concatMap((geometryTypes: string[]) => this.clientSchemaParcelFormService
          .buildCreateForm(this.schema, this.map, geometryTypes)
        )
      )
      .subscribe((form: Form) => this.setForm(form));
  }

  ngOnDestroy() {
    if (this.geometry$$ !== undefined) {
      this.geometry$$.unsubscribe();
      this.geometry$$ = undefined;
    }
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit(data: Feature) {
    const parcel = this.formDataToParcel(data);
    this.errorMessage$.next(getSchemaElementValidationMessage(parcel, this.languageService));
    if (this.errorMessage$.value === undefined) {
      this.onSubmitSuccess(parcel);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  private onSubmitSuccess(parcel: ClientSchemaParcel) {
    this.transaction.insert(parcel, this.store, {
      title: generateOperationTitle(parcel)
    });
    this.complete.emit();
  }

  private formDataToParcel(data: Feature): ClientSchemaParcel {
    const properties = Object.assign({
      noParcelleAgricole: undefined,
      idSchema: this.schema.id,
      idElementGeometrique: undefined,
      typeElement: undefined,
      descriptionTypeElement: undefined,
      etiquette: undefined,
      description: undefined,
      anneeImage: undefined,
      timbreMaj: undefined,
      usagerMaj: undefined
    }, data.properties);

    const parcel = Object.assign({}, data, {properties});
    const typeDescription = this.clientSchemaElementService
      .getSchemaElementTypeDescription(properties.typeElement);
    parcel.properties.superficie = computeSchemaElementArea(parcel);
    parcel.properties.descriptionTypeElement = typeDescription;

    return parcel;
  }

  private setForm(form: Form) {
    this.geometry$$ = form.control.controls.geometry.valueChanges
      .subscribe((geometry: GeoJSONGeometry) => {
        // When the drawGuide field is focused, changing tab
        // triggers an an "afterViewInit" error. Unfocusing the active
        // parcel (whatever it is) fixes it.
        if ('activeElement' in document) {
          (document.activeElement as HTMLElement).blur();
        }
        this.tabIndex$.next(1);
        this.updateElementTypeChoices(geometry.type);
      });

    this.form$.next(form);
  }

  private updateElementTypeChoices(geometryType: string) {
    this.clientSchemaElementService
      .getSchemaElementTypes(this.schema.type)
      .subscribe((elementTypes: ClientSchemaElementTypes) => {
        const form = this.form$.value;
        const elementTypeField = form.groups[0].fields.find((field: FormField) => {
          return field.name === 'properties.typeElement';
        }) as FormField<FormFieldSelectInputs>;
        const choices$ = elementTypeField.inputs.choices as BehaviorSubject<FormFieldSelectChoice[]>;
        choices$.next(elementTypes[geometryType]);
      });
  }

}
