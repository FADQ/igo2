import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

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
import { Feature, FeatureStore, IgoMap } from '@igo2/geo';

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
  selector: 'fadq-client-schema-parcel-update-form',
  templateUrl: './client-schema-parcel-update-form.component.html',
  styleUrls: ['./client-schema-parcel-update-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaParcelUpdateFormComponent implements OnInit, OnUpdateInputs, WidgetComponent {

  /**
   * Update form
   * @internal
   */
  form$ = new BehaviorSubject<Form>(undefined);

  /**
   * Import error, if any
   * @internal
   */
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject(undefined);

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
   * Schema parcel
   */
  @Input() element: ClientSchemaParcel;

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
    this.clientSchemaParcelFormService
      .buildUpdateForm(this.schema, this.map, [this.element.geometry.type])
      .subscribe((form: Form) => this.setForm(form));
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
    this.transaction.update(this.element, parcel, this.store, {
      title: generateOperationTitle(parcel)
    });
    this.complete.emit();
  }

  private formDataToParcel(data: Feature): ClientSchemaParcel {
    const parcel = Object.assign({}, data as ClientSchemaParcel);
    const typeDescription = this.clientSchemaElementService
      .getSchemaElementTypeDescription(parcel.properties.typeElement);
    parcel.properties.superficie = computeSchemaElementArea(parcel);
    parcel.properties.descriptionTypeElement = typeDescription;
    return parcel;
  }

  private setForm(form: Form) {
    this.clientSchemaElementService
      .getSchemaElementTypes(this.schema.type)
      .subscribe((elementTypes: ClientSchemaElementTypes) => {
        const geometryType = this.element.geometry.type;
        const elementTypeField = form.groups[0].fields.find((field: FormField) => {
          return field.name === 'properties.typeElement';
        }) as FormField<FormFieldSelectInputs>;

        const choices$ = elementTypeField.inputs.choices as BehaviorSubject<FormFieldSelectChoice[]>;
        choices$.next(elementTypes[geometryType]);
        this.form$.next(form);
      });
  }

}
