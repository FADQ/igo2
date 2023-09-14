import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { BehaviorSubject, Observable} from 'rxjs';
import { map } from 'rxjs/operators';

import OlGeoJSON from 'ol/format/GeoJSON';
import * as olFormat from 'ol/format';

import {
  EntityTransaction,
  Form,
  FormField,
  FormFieldSelectInputs,
  getAllFormFields,
  WidgetComponent,
  OnUpdateInputs,
  FormFieldSelectChoice
} from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { FeatureStore, IgoMap } from '@igo2/geo';

import { getAnneeImageFromMap } from '../../shared/client.utils';
import { EditionResult } from '../../../edition/shared/edition.interfaces';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElement, ClientSchemaElementTypes } from '../shared/client-schema-element.interfaces';
import { ClientSchemaElementService } from '../shared/client-schema-element.service';
import { ClientSchemaElementFormService } from '../shared/client-schema-element-form.service';

import {
  generateSchemaElementOperationTitle,
  getSchemaElementValidationMessage,
  updateElementTypeChoices,
  getAnneeImageField,
  processAnneeImageField
} from '../shared/client-schema-element.utils';

@Component({
  selector: 'fadq-client-schema-element-update',
  templateUrl: './client-schema-element-update.component.html',
  styleUrls: ['./client-schema-element-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaElementUpdateComponent
    implements OnInit, OnUpdateInputs, WidgetComponent {

  /**
   * Update form
   * @internal
   */
  form$ = new BehaviorSubject<Form>(undefined);

  /**
   * Map to draw elements on
   */
  @Input() map: IgoMap;

  /**
   * Schema element store
   */
  @Input() store: FeatureStore<ClientSchemaElement>;

  /**
   * Schema element transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Schema element
   */
  @Input() schemaElement: ClientSchemaElement;

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

  get getOperationTitle(): (data: ClientSchemaElement, languageService: LanguageService) => string {
    return generateSchemaElementOperationTitle;
  }

  get processData(): (data: ClientSchemaElement) => Observable<EditionResult> {
    return (data: ClientSchemaElement): Observable<EditionResult> => this.processSchemaElement(data);
  }

  constructor(
    private clientSchemaElementService: ClientSchemaElementService,
    private clientSchemaElementFormService: ClientSchemaElementFormService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clientSchemaElementFormService
      .buildUpdateForm(this.schema, this.map, this.store)
      .subscribe((form: Form) => this.setForm(form));
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onComplete(schemaElement: ClientSchemaElement) {
    this.complete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  /**
   * Process a schema element
   * @param data The client schema element to process
   * @returns The schema element processed
   */
  private processSchemaElement(data: ClientSchemaElement): Observable<EditionResult> {
    return this.clientSchemaElementService.createSchemaElement(this.schema, data)
      .pipe(
        map((schemaElement: ClientSchemaElement): EditionResult => {
          processAnneeImageField(schemaElement,getAnneeImageField(this.form$), this.clientSchemaElementService,this.map);
          return {
            feature: schemaElement,
            error: getSchemaElementValidationMessage(schemaElement, this.languageService)
          };
        })
      );
  }

  private setForm(form: Form) {
    this.form$.next(form);
    const geometryType = this.schemaElement.geometry.type;
    updateElementTypeChoices(geometryType,this.clientSchemaElementService, this.schema, this.getElementTypeField());
  }

  private getElementTypeField(): FormField<FormFieldSelectInputs> {
    const fields = getAllFormFields(this.form$.value);
    return fields.find((field: FormField) => {
      return field.name === 'properties.typeElement';
    }) as FormField<FormFieldSelectInputs>;
  }
}
