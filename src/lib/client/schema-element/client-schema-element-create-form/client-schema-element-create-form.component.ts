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

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

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
import { FeatureStore, IgoMap, GeoJSONGeometry } from '@igo2/geo';

import { EditionResult } from '../../../edition/shared/edition.interfaces';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElement, ClientSchemaElementTypes } from '../shared/client-schema-element.interfaces';
import { ClientSchemaElementService } from '../shared/client-schema-element.service';
import { ClientSchemaElementFormService } from '../shared/client-schema-element-form.service';

import {
  generateSchemaElementOperationTitle,
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
  groupIndex$ = new BehaviorSubject<number>(0);

  /**
   * Subscription to the value changes event
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

  get getOperationTitle(): (data: ClientSchemaElement, languageService: LanguageService) => string  {
    return generateSchemaElementOperationTitle;
  }
  
  get processData(): (data: ClientSchemaElement) => Observable<EditionResult>  {
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
      .buildCreateForm(this.schema, this.map)
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

  onComplete(element: ClientSchemaElement) {
    this.complete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  private processSchemaElement(data: ClientSchemaElement): Observable<EditionResult> {
    return this.clientSchemaElementService.createSchemaElement(this.schema, data)
      .pipe(
        map((element: ClientSchemaElement): EditionResult => {
          return {
            feature: element,
            error: getSchemaElementValidationMessage(element, this.languageService)
          }
        })
      )
  }

  private setForm(form: Form) {
    this.form$.next(form);

    const geometryField = form.groups[0].fields.find((field: FormField) => {
      return field.name === 'geometry';
    });

    this.geometry$$ = geometryField.control.valueChanges
      .subscribe((geometry: GeoJSONGeometry) => {
        // When the drawGuide field is focused, changing tab
        // triggers an an "afterViewInit" error. Unfocusing the active
        // element (whatever it is) fixes it.
        if ('activeElement' in document) {
          (document.activeElement as HTMLElement).blur();
        }
        this.groupIndex$.next(1);
        this.updateElementTypeChoices(geometry.type);
      });
  }

  private updateElementTypeChoices(geometryType: string) {
    this.clientSchemaElementService
      .getSchemaElementTypes(this.schema.type)
      .subscribe((elementTypes: ClientSchemaElementTypes) => {
        const form = this.form$.value;
        const elementTypeField = form.groups[1].fields.find((field: FormField) => {
          return field.name === 'properties.typeElement';
        }) as FormField<FormFieldSelectInputs>;
        const choices$ = elementTypeField.inputs.choices as BehaviorSubject<FormFieldSelectChoice[]>;
        choices$.next(elementTypes[geometryType]);
      });
  }

}
