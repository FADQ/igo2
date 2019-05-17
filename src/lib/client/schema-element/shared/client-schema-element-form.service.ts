import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

import { BehaviorSubject, Observable, of, zip } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Injectable()
export class ClientSchemaElementFormService {

  constructor(
    private formService: FormService,
    private languageService: LanguageService
  ) {}

  buildCreateForm(schema: ClientSchema, igoMap: IgoMap, geometryTypes: string[]): Observable<Form> {
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

    return zip(geometryFields$, infoFields$)
      .pipe(
        map((fields: [FormField[], FormField[]]) => {
          return this.formService.form(fields[0], [
            this.formService.group({name: 'info'}, fields[1])
          ]);
        })
      );
  }

  buildUpdateForm(schema: ClientSchema, igoMap: IgoMap, geometryTypes: string[]): Observable<Form> {
    return this.buildCreateForm(schema, igoMap, geometryTypes);
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
      title: 'Année d\image',
      options:  {
        cols: 1,
        validator: Validators.compose([
          Validators.pattern(/^([1-9][\d]{3})$/)
        ]),
        errors: {
          pattern: 'client.schema.error.invalidAnnee'
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
        drawGuide: 0,
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
