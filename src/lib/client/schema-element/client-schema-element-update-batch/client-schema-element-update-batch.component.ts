import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import {
  map
} from 'rxjs/operators';

import {
  EntityTransaction
} from '@igo2/common/entity';

import {
  Form,
  FormField,
  FormFieldSelectInputs,
  getAllFormFields
} from '@igo2/common/form';

import {
  WidgetComponent
} from '@igo2/common/widget';

import {
  OnUpdateInputs
} from '@igo2/common/dynamic-component';

import {
  LanguageService
} from '@igo2/core/language';

import {
  FeatureStore,
  IgoMap
} from '@igo2/geo';

import {
  EditionResult
} from '../../../edition/shared/edition.interfaces';

import {
  ClientSchema
} from '../../schema/shared/client-schema.interfaces';

import {
  ClientSchemaElement,
  ClientSchemaElementTypes
} from '../shared/client-schema-element.interfaces';

import {
  ClientSchemaElementService
} from '../shared/client-schema-element.service';

import {
  ClientSchemaElementFormService
} from '../shared/client-schema-element-form.service';

import {
  generateSchemaElementOperationTitle,
  getSchemaElementValidationMessage,
  updateElementTypeChoices
} from '../shared/client-schema-element.utils';

import {
  isBehaviorSubject
} from '../../../utils/rxjs.utils';

@Component({
  selector: 'fadq-client-schema-element-update-batch',
  templateUrl: './client-schema-element-update-batch.component.html',
  styleUrls: ['./client-schema-element-update-batch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaElementUpdateBatchComponent
  implements OnInit, OnUpdateInputs, WidgetComponent {

  /**
   * Update form
   * @internal
   */
  form$ = new BehaviorSubject<Form | undefined>(undefined);

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
   * Schema elements
   */
  @Input() schemaElements: ClientSchemaElement[];

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
    private clientSchemaElementFormService: ClientSchemaElementFormService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.clientSchemaElementFormService
      .buildUpdateBatchForm(
        this.map,
        this.schema,
        this.store
      )
      .subscribe({
        next: (form: Form) => {
          this.setForm(form);
        },

        error: (error: unknown) => {
          console.error(
            'Error building update batch form',
            error
          );
        }
      });
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs(): void {
    this.cdRef.markForCheck();
  }

  onComplete(schemaElement: ClientSchemaElement): void {
    this.complete.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get getOperationTitle():
    (data: ClientSchemaElement, languageService: LanguageService) => string {

    return generateSchemaElementOperationTitle;
  }

  get processData():
    (data: ClientSchemaElement) => Observable<EditionResult> {

    return (data: ClientSchemaElement): Observable<EditionResult> => {
      return this.processSchemaElement(data);
    };
  }

  private processSchemaElement(
    data: ClientSchemaElement
  ): Observable<EditionResult> {

    return this.clientSchemaElementService
      .createSchemaElement(this.schema, data)
      .pipe(
        map((schemaElement: ClientSchemaElement): EditionResult => {

          return {
            feature: schemaElement,

            error: getSchemaElementValidationMessage(
              schemaElement,
              this.languageService
            )
          };
        })
      );
  }

  private setForm(form: Form): void {

    console.log('UPDATE BATCH FORM', form);

    this.form$.next(form);

    if (
      !this.schemaElements ||
      this.schemaElements.length === 0
    ) {

      console.error(
        'No schema elements available'
      );

      return;
    }

    const geometry = this.schemaElements[0]?.geometry;

    if (!geometry?.type) {

      console.error(
        'Schema element geometry type missing'
      );

      return;
    }

    const geometryType =
      geometry.type as keyof ClientSchemaElementTypes;

    const elementTypeField =
      this.getElementTypeField();

    if (!elementTypeField) {

      console.error(
        'Element type field missing'
      );

      return;
    }

    updateElementTypeChoices(
      geometryType,
      this.clientSchemaElementService,
      this.schema,
      elementTypeField
    );

    // -------------------------------------------------------------------
    // Validation runtime du choices observable
    // -------------------------------------------------------------------

    const choicesInput =
      elementTypeField.inputs?.choices;

    if (
      choicesInput &&
      isBehaviorSubject(choicesInput)
    ) {

      console.log(
        'Element type choices updated',
        choicesInput.value
      );
    }

    this.cdRef.markForCheck();
  }

  private getElementTypeField():
    FormField<FormFieldSelectInputs> | undefined {

    const form = this.form$.value;

    if (!form) {
      return undefined;
    }

    const fields = getAllFormFields(form);

    return fields.find(
      (field: FormField) => {
        return field.name === 'properties.typeElement';
      }
    ) as FormField<FormFieldSelectInputs> | undefined;
  }
}
