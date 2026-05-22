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

import {
  BehaviorSubject,
  Observable,
  Subscription,
  of
} from 'rxjs';

import {
  delay,
  map,
  switchMap
} from 'rxjs/operators';

import { EntityTransaction } from '@igo2/common/entity';

import {
  Form,
  FormField,
  FormFieldSelectChoice,
  FormFieldSelectInputs,
  getAllFormFields
} from '@igo2/common/form';

import { WidgetComponent } from '@igo2/common/widget';
import { OnUpdateInputs } from '@igo2/common/dynamic-component';

import { LanguageService } from '@igo2/core/language';

import {
  FeatureStore,
  IgoMap,
  GeoJSONGeometry,
  GeometryFormFieldInputs
} from '@igo2/geo';

import { EditionResult } from '../../../edition/shared/edition.interfaces';

import { getAnneeImageFromMap } from '../../shared/client.utils';

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';

import {
  ClientSchemaElement,
  ClientSchemaElementType
} from '../shared/client-schema-element.interfaces';

import { ClientSchemaElementService } from '../shared/client-schema-element.service';

import { ClientSchemaElementFormService } from '../shared/client-schema-element-form.service';

import {
  generateSchemaElementOperationTitle,
  getSchemaElementValidationMessage,
  updateElementTypeChoices,
  processAnneeImageField
} from '../shared/client-schema-element.utils';
import { isBehaviorSubject } from '@lib/utils/rxjs.utils';

@Component({
  selector: 'fadq-client-schema-element-create',
  templateUrl: './client-schema-element-create.component.html',
  styleUrls: ['./client-schema-element-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaElementCreateComponent
  implements OnInit, OnDestroy, OnUpdateInputs, WidgetComponent {

  form$ = new BehaviorSubject<Form | undefined>(undefined);

  groupIndex$ = new BehaviorSubject<number>(0);

  private geometry$$?: Subscription;

  private elementType$$?: Subscription;

  @Input() map: IgoMap;

  @Input() store: FeatureStore<ClientSchemaElement>;

  @Input() transaction: EntityTransaction;

  @Input() schema: ClientSchema;

  @Output() complete = new EventEmitter<void>();

  @Output() cancel = new EventEmitter<void>();

  constructor(
    private clientSchemaElementService: ClientSchemaElementService,
    private clientSchemaElementFormService: ClientSchemaElementFormService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.clientSchemaElementFormService
      .buildCreateForm(
        this.schema,
        this.map,
        this.store
      )
      .subscribe({
        next: (form: Form) => {
          this.setForm(form);
        },
        error: (error: unknown) => {
          console.error('Error building create form', error);
        }
      });
  }

  ngOnDestroy(): void {

    this.geometry$$?.unsubscribe();
    this.elementType$$?.unsubscribe();
  }

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
        switchMap((schemaElement: ClientSchemaElement) =>

          processAnneeImageField(
            schemaElement,
            this.clientSchemaElementService,
            this.map
          ).pipe(

            map((updatedSchemaElement: ClientSchemaElement): EditionResult => ({
              feature: updatedSchemaElement,
              error: getSchemaElementValidationMessage(
                updatedSchemaElement,
                this.languageService
              )
            }))
          )
        )
      );
  }


  private setForm(form: Form): void {

    console.log('FORM', form);

    this.form$.next(form);

    const fields = getAllFormFields(form);

    const anneeImageField = fields.find(
      (field: FormField) => field.name === 'properties.anneeImage'
    );

    const geometryField = fields.find(
      (field: FormField) => field.name === 'geometry'
    ) as FormField<GeometryFormFieldInputs>;

    const elementTypeField = fields.find(
      (field: FormField) => field.name === 'properties.typeElement'
    ) as FormField<FormFieldSelectInputs>;

    console.log('anneeImageField', anneeImageField);
    console.log('geometryField', geometryField);
    console.log('elementTypeField', elementTypeField);

    // ---------------------------------------------------------------------
    // Année image
    // ---------------------------------------------------------------------

    if (anneeImageField?.control) {

      const imageYear = getAnneeImageFromMap(this.map);

      if (imageYear !== undefined && imageYear !== null) {

        anneeImageField.control.setValue(imageYear);
        anneeImageField.control.updateValueAndValidity();

      } else {

        // ✅ attendre que la géométrie soit dessinée
        geometryField?.control?.valueChanges.subscribe((geometry) => {

          if (!geometry) {
            return;
          }

          this.clientSchemaElementService
            .getMostRecentImageYear(geometry)
            .subscribe((response: any) => {

              const year = response?.data;

              if (year) {
                anneeImageField.control.setValue(year);
                anneeImageField.control.updateValueAndValidity();
                this.cdRef.markForCheck();
              }
            });
        });
      }
    }


    console.log('CONTROL READY ?', anneeImageField.control);
    console.log('VALUE AFTER SET', anneeImageField.control.value);

    // ---------------------------------------------------------------------
    // Validation défensive
    // ---------------------------------------------------------------------

    if (!geometryField?.control) {
      console.error('Geometry field missing');
      return;
    }

    if (!elementTypeField?.control) {
      console.error('Element type field missing');
      return;
    }

    // ---------------------------------------------------------------------
    // Cleanup anciennes subscriptions
    // ---------------------------------------------------------------------

    this.geometry$$?.unsubscribe();
    this.elementType$$?.unsubscribe();

    // ---------------------------------------------------------------------
    // Geometry changes
    // ---------------------------------------------------------------------

    this.geometry$$ = geometryField.control.valueChanges
      .subscribe((geometry: GeoJSONGeometry | null) => {

        console.log('Geometry changed', geometry);

        if (!geometry?.type) {
          return;
        }

        updateElementTypeChoices(
          geometry.type as any,
          this.clientSchemaElementService,
          this.schema,
          elementTypeField
        );
      });

    // ---------------------------------------------------------------------
    // Element type changes
    // ---------------------------------------------------------------------

    this.elementType$$ = elementTypeField.control.valueChanges
      .subscribe((elementType: string | null) => {

        console.log('Element type changed', elementType);

        if (!elementType) {
          return;
        }

        this.updateGeometryType(elementType);
      });

    this.cdRef.markForCheck();
  }

  private getElementTypeField():
    FormField<FormFieldSelectInputs> | undefined {

    const fields = getAllFormFields(this.form$.value);

    return fields.find(
      (field: FormField) => field.name === 'properties.typeElement'
    ) as FormField<FormFieldSelectInputs>;
  }

  private getGeometryField():
    FormField<GeometryFormFieldInputs> | undefined {

    const fields = getAllFormFields(this.form$.value);

    return fields.find(
      (field: FormField) => field.name === 'geometry'
    ) as FormField<GeometryFormFieldInputs>;
  }

  private updateGeometryType(elementTypeValue: string): void {

    const elementTypeField = this.getElementTypeField();
    const geometryField = this.getGeometryField();

    if (!elementTypeField || !geometryField) {
      return;
    }

    const choices = (
      elementTypeField.inputs.choices as BehaviorSubject<FormFieldSelectChoice[]>
    ).value;

    const elementTypes = choices.filter(
      (choice): choice is ClientSchemaElementType => {
        return 'geometryType' in choice;
      }
    );

    const elementType = elementTypes.find(
      (_elementType: ClientSchemaElementType) => {
        return _elementType.value === elementTypeValue;
      }
    );

    if (!elementType) {
      return;
    }

    const geometryTypeInput = geometryField.inputs.geometryType;

    if (isBehaviorSubject<string>(geometryTypeInput)) {

      geometryTypeInput.next(
        elementType.geometryType
      );
    }

    of(null)
      .pipe(delay(50))
      .subscribe(() => {

        if ('activeElement' in document) {
          (document.activeElement as HTMLElement)?.blur();
        }
      });
  }
}
