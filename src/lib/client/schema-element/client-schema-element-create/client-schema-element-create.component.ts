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
  combineLatest,
  Observable,
  Subject,
  Subscription
} from 'rxjs';

import {
  filter,
  map,
  switchMap,
  takeUntil
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
  GeometryFormFieldInputs
} from '@igo2/geo';

import { EditionResult } from '../../../edition/shared/edition.interfaces';


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

  private destroy$ = new Subject<void>();

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
          console.error('Erreur dans l\'initialisation du formulaire', error);
        }
      });
  }

  ngOnDestroy(): void {

    this.geometry$$?.unsubscribe();
    this.elementType$$?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
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

    this.form$.next(form);

    const geometryField = this.getGeometryField();
    const elementTypeField = this.getElementTypeField();
    const anneeImageField = this.getAnneeImageField();
    const idField = this.getIdField();

    if (!geometryField?.control || !elementTypeField?.control) {
      console.error('Champs requis manquants');
      return;
    }

    // ✅ Désactiver champs non éditables
    // ✅ Exclure *réellement* du form Angular
    if (anneeImageField?.control) {
      anneeImageField.control.clearValidators();
      anneeImageField.control.setErrors(null);
      anneeImageField.control.disable({ emitEvent: false });
    }

    if (idField?.control) {
      idField.control.clearValidators();
      idField.control.setErrors(null);
      idField.control.disable({ emitEvent: false });
    }

    // ---------------------------------------------------------------------
    // ✅ Streams métier
    // ---------------------------------------------------------------------

    const geometry$ = geometryField.control.valueChanges.pipe(
      takeUntil(this.destroy$),
      filter(geo => !!geo)
    );

    const type$ = elementTypeField.control.valueChanges.pipe(
      takeUntil(this.destroy$),
      filter(type => !!type)
    );

    // ---------------------------------------------------------------------
    // ✅ Type → geometryType (UI)
    // ---------------------------------------------------------------------

    type$.subscribe(type => {
      this.updateGeometryType(type);
    });

    // ---------------------------------------------------------------------
    // ✅ Geometry → année image
    // ---------------------------------------------------------------------

    geometry$.pipe(
      switchMap(geometry =>
        this.clientSchemaElementService.getMostRecentImageYear(geometry)
      )
    ).subscribe((response: any) => {

      const year = response?.data;

      if (anneeImageField?.control && year) {
        anneeImageField.control.setValue(String(year), { emitEvent: false });
      }

      this.cdRef.markForCheck();
    });

    // ---------------------------------------------------------------------
    // ✅ VALIDATION MÉTIER (clé)
    // ---------------------------------------------------------------------

    combineLatest([geometry$, type$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {

        // 👉 IMPORTANT : ne dépend plus de Angular
        this.markFormReady();

        this.cdRef.markForCheck();
      });

    this.cdRef.markForCheck();
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

    const elementType = choices
      .filter((c): c is ClientSchemaElementType => 'geometryType' in c)
      .find(c => c.value === elementTypeValue);

    if (!elementType) {
      return;
    }

    const geometryTypeInput = geometryField.inputs.geometryType;

    if (isBehaviorSubject<string>(geometryTypeInput)) {
      geometryTypeInput.next(elementType.geometryType);
    }
  }

  private getGeometryField(): FormField<GeometryFormFieldInputs> | undefined {
    return getAllFormFields(this.form$.value)
      .find(f => f.name === 'geometry') as FormField<GeometryFormFieldInputs>;
  }

  private getElementTypeField(): FormField<FormFieldSelectInputs> | undefined {
    return getAllFormFields(this.form$.value)
      .find(f => f.name === 'properties.typeElement') as FormField<FormFieldSelectInputs>;
  }

  private getAnneeImageField(): FormField | undefined {
    return getAllFormFields(this.form$.value)
      .find(f => f.name === 'properties.anneeImage');
  }

  private getIdField(): FormField | undefined {
    return getAllFormFields(this.form$.value)
      .find(f => f.name === 'properties.idElementGeometrique');
  }

  private markFormReady(): void {

    const formCtrl = this.form$.value?.control;

    if (!formCtrl) {
      return;
    }

    // ✅ Parcourir tous les controls via API publique
    Object.keys(formCtrl.controls).forEach(key => {
      const control = formCtrl.controls[key];

      // ✅ Nettoyer erreurs
      control.setErrors(null);

      // ✅ recalcul individuel
      control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    // ✅ Nettoyer le form global
    formCtrl.setErrors(null);

    // ✅ recalcul global
    formCtrl.updateValueAndValidity({ emitEvent: true });

    formCtrl.markAsDirty();
    formCtrl.markAsTouched();

  }
}
