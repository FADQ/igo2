import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

import { BehaviorSubject, Observable, of, zip } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  Form,
  FormField,
  FormFieldConfig,
  FormFieldSelectInputs,
  FormService
} from '@igo2/common';
import { IgoMap } from '@igo2/geo';

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElementService } from './client-schema-element.service';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementFormService {

  constructor(
    private formService: FormService,
    private languageService: LanguageService,
    private schemaElementService: ClientSchemaElementService
  ) {}

  buildCreateForm(schema: ClientSchema, igoMap: IgoMap): Observable<Form> {
    return this.schemaElementService.getSchemaElementGeometryTypes(schema.type)
      .pipe(
        concatMap((geometryTypes: string[]) => {
          const geometryFields$ = zip(
            this.createGeometryField({inputs: {
              map: igoMap,
              geometryTypes,
              geometryType: geometryTypes.length > 0 ? geometryTypes[0] : undefined
            }})
          );

          const infoFields$ = zip(
            this.createIdField({options: {disabled: true}}),
            this.createTypeElementField(),
            this.createDescriptionField(),
            this.createEtiquetteField(),
            this.createAnneeImageField()
          );

          const geometryTitle = this.languageService.translate.instant('geometry.geometry');
          const infoTitle = this.languageService.translate.instant('informations');

          return zip(geometryFields$, infoFields$)
            .pipe(
              map((fields: [FormField[], FormField[]]) => {
                return this.formService.form([], [
                  this.formService.group({name: 'geometry', title: geometryTitle}, fields[0]),
                  this.formService.group({name: 'info', title: infoTitle}, fields[1])
                ]);
              })
            );
        })
      );
  }

  buildUpdateForm(schema: ClientSchema, igoMap: IgoMap): Observable<Form> {
    return this.buildCreateForm(schema, igoMap);
  }

  buildUpdateBatchForm(schema: ClientSchema): Observable<Form> {
    const infoFields$ = zip(
      this.createDescriptionField({options: {disabled: true, disableSwitch: true}}),
      this.createEtiquetteField({options: {disabled: true, disableSwitch: true}}),
      this.createAnneeImageField({options: {disabled: true, disableSwitch: true}})
    );

    const infoTitle = this.languageService.translate.instant('informations');

    return infoFields$
      .pipe(
        map((fields: FormField[]) => {
          return this.formService.form([], [
            this.formService.group({name: 'info', title: infoTitle}, fields)
          ]);
        })
      );
  }

  private createIdField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.idElementGeometrique',
      title: 'ID',
      options:  {
        cols: 1
      }
    }, partial));
  }

  private createDescriptionField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.description',
      title: 'Description',
      options:  {
        cols: 2,
        validator: Validators.maxLength(250),
        errors: {
          maxlength: 'client.schemaElement.error.descriptionMaxLength'
        }
      }
    }, partial));
  }

  private createEtiquetteField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.etiquette',
      title: 'Étiquette',
      options:  {
        cols: 1,
        validator: Validators.maxLength(25),
        errors: {
          maxlength: 'client.schemaElement.error.etiquetteMaxLength'
        }
      }
    }, partial));
  }

  private createAnneeImageField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.anneeImage',
      title: 'Année d\'image',
      options:  {
        cols: 1,
        validator: Validators.compose([
          Validators.pattern(/^([1-9][\d]{3})$/)
        ]),
        errors: {
          pattern: 'errors.invalidAnnee'
        }
      }
    }, partial));
  }

  private createGeometryField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'geometry',
      title: 'Géometrie',
      options:  {
        cols: 2,
        validator: Validators.required
      },
      type: 'geometry',
      inputs: {
        geometryTypeField: true,
        drawGuideField: true,
        drawGuide: undefined,
        drawGuidePlaceholder: 'Guide d\'aide au traçage',
        measure: true
      }
    }, partial));
  }

  private createTypeElementField(
    partial?: Partial<FormFieldConfig>
  ): Observable<FormField<FormFieldSelectInputs>> {

    return of(this.createField({
      name: 'properties.typeElement',
      title: 'Type d\'élément',
      type: 'select',
      options:  {
        cols: 1,
        validator: Validators.required
      },
      inputs: {
        choices: new BehaviorSubject([])
      }
    }, partial) as FormField<FormFieldSelectInputs>);
  }

  private createField(config: FormFieldConfig, partial?: Partial<FormFieldConfig>): FormField {
    config = this.formService.extendFieldConfig(config, partial || {});
    return this.formService.field(config);
  }
}
