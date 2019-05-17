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
import { ClientSchemaElement, ClientSchemaElementTypes } from '../shared/client-schema-element.interfaces';
import { ClientSchemaElementService } from '../shared/client-schema-element.service';
import { ClientSchemaElementFormService } from '../shared/client-schema-element-form.service';

import {
  generateOperationTitle,
  computeSchemaElementArea,
  getSchemaElementValidationMessage
} from '../shared/client-schema-element.utils';

@Component({
  selector: 'fadq-client-schema-element-create-form',
  templateUrl: './client-schema-element-create-form.component.html',
  styleUrls: ['./client-schema-element-create-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaElementCreateFormComponent
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

  constructor(
    private clientSchemaElementService: ClientSchemaElementService,
    private clientSchemaElementFormService: ClientSchemaElementFormService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clientSchemaElementService
      .getSchemaElementGeometryTypes(this.schema.type)
      .pipe(
        concatMap((geometryTypes: string[]) => this.clientSchemaElementFormService
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
    const element = this.formDataToElement(data);
    this.errorMessage$.next(getSchemaElementValidationMessage(element, this.languageService));
    if (this.errorMessage$.value === undefined) {
      this.onSubmitSuccess(element);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  private onSubmitSuccess(element: ClientSchemaElement) {
    this.transaction.insert(element, this.store, {
      title: generateOperationTitle(element)
    });
    this.complete.emit();
  }

  private formDataToElement(data: Feature): ClientSchemaElement {
    const properties = Object.assign({
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

    const element = Object.assign({}, data, {properties});
    const typeDescription = this.clientSchemaElementService
      .getSchemaElementTypeDescription(properties.typeElement);
    element.properties.superficie = computeSchemaElementArea(element);
    element.properties.descriptionTypeElement = typeDescription;

    return element;
  }

  private setForm(form: Form) {
    this.geometry$$ = form.control.controls.geometry.valueChanges
      .subscribe((geometry: GeoJSONGeometry) => {
        // When the drawGuide field is focused, changing tab
        // triggers an an "afterViewInit" error. Unfocusing the active
        // element (whatever it is) fixes it.
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
