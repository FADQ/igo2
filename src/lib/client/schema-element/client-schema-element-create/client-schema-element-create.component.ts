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

import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import {
  EntityTransaction,
  Form,
  FormField,
  FormFieldSelectInputs,
  getAllFormFields,
  WidgetComponent,
  OnUpdateInputs
} from '@igo2/common';
import { LanguageService } from '@igo2/core';
import {
  FeatureStore,
  IgoMap,
  GeoJSONGeometry,
  GeometryFormFieldInputs
} from '@igo2/geo';

import { getMapExtentPolygon } from '../../../map';

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
  updateElementTypeChoices
} from '../shared/client-schema-element.utils';

@Component({
  selector: 'fadq-client-schema-element-create',
  templateUrl: './client-schema-element-create.component.html',
  styleUrls: ['./client-schema-element-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaElementCreateComponent
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
  groupIndex$ = new BehaviorSubject<number>(0);

  /**
   * Subscription to the geometry changes event
   */
  private geometry$$: Subscription;

  /**
   * Subscription to the type changes event
   */
  private elementType$$: Subscription;

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
      .buildCreateForm(this.schema, this.map, this.store)
      .subscribe((form: Form) => this.setForm(form));
  }

  ngOnDestroy() {
    if (this.geometry$$ !== undefined) {
      this.geometry$$.unsubscribe();
      this.geometry$$ = undefined;
    }
    if (this.elementType$$ !== undefined) {
      this.elementType$$.unsubscribe();
      this.elementType$$ = undefined;
    }
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

  private processSchemaElement(data: ClientSchemaElement): Observable<EditionResult> {
    return this.clientSchemaElementService.createSchemaElement(this.schema, data)
      .pipe(
        map((schemaElement: ClientSchemaElement): EditionResult => {
          return {
            feature: schemaElement,
            error: getSchemaElementValidationMessage(schemaElement, this.languageService)
          };
        })
      );
  }

  private setForm(form: Form) {
    this.form$.next(form);

    const anneeImageField = this.getAnneeImageField();
    anneeImageField.control.value
    if (anneeImageField !== undefined) {
      let imageYear = getAnneeImageFromMap(this.map);
      if (imageYear === undefined) {
        const extentGeometry = getMapExtentPolygon(this.map, 'EPSG:4326');
        this.clientSchemaElementService.getMostRecentImageYear(extentGeometry)
          .subscribe((reponse: any) => {
            anneeImageField.control.setValue(reponse.data);
        });
      } else {
        anneeImageField.control.setValue(imageYear);
      }
    }

    const geometryField = this.getGeometryField();
    this.geometry$$ = geometryField.control.valueChanges
      .subscribe((geometry: GeoJSONGeometry) => updateElementTypeChoices(geometry.type, this.clientSchemaElementService,this.schema, this.getElementTypeField()));

    const elementTypeField = this.getElementTypeField();
    this.elementType$$ = elementTypeField.control.valueChanges
      .subscribe((elementType: string) => this.updateGeometryType(elementType));
  }

  private getAnneeImageField(): FormField {
    const fields = getAllFormFields(this.form$.value);
    return fields.find((field: FormField) => {
      return field.name === 'properties.anneeImage';
    });
  }

  private getElementTypeField(): FormField<FormFieldSelectInputs> {
    const fields = getAllFormFields(this.form$.value);
    return fields.find((field: FormField) => {
      return field.name === 'properties.typeElement';
    }) as FormField<FormFieldSelectInputs>;
  }

  private getGeometryField(): FormField<GeometryFormFieldInputs> {
    const fields = getAllFormFields(this.form$.value);
    return fields.find((field: FormField) => {
      return field.name === 'geometry';
    }) as FormField<GeometryFormFieldInputs>;
  }

  private updateGeometryType(elementTypeValue: string) {
    const elementTypeField = this.getElementTypeField();
    const geometryField = this.getGeometryField();

    const elementTypes = (elementTypeField.inputs.choices as BehaviorSubject<ClientSchemaElementType[]>).value;
    const elementType = elementTypes.find((_elementType: ClientSchemaElementType) => {
      return _elementType.value === elementTypeValue;
    });

    // TODO: See why we need to cast as unknown
    const geometryType$ = geometryField.inputs.geometryType as unknown as BehaviorSubject<string>;
    geometryType$.next(elementType.geometryType);

    // Blur the active element to allow the use of the spacebar shortcut
    // We need to wrap this up in a delay otherwise, material will
    // focus the drop list after we blur the selected option
    of(null).pipe(
      delay(50)
    ).subscribe(() => {
      if ('activeElement' in document) {
        (document.activeElement as HTMLElement).blur();
      }
    });
  }
}
