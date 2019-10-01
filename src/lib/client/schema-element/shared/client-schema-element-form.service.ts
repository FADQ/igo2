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
  FormService,
  FormFieldSelectChoice
} from '@igo2/common';
import { IgoMap } from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import { createOlEditionStyle } from '../../../edition/shared/edition.utils';

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import {
  ClientSchemaElementType,
  ClientSchemaElementTypes
} from './client-schema-element.interfaces';
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
    const infoFields$ = zip(
      this.createIdField({options: {disabled: true}}),
      this.createTypeElementField(schema.type),
      this.createDescriptionField(),
      this.createEtiquetteField(),
      this.createAnneeImageField()
    );

    const geometryFields$ = zip(
      this.createGeometryField({inputs: {
        map: igoMap
      }})
    );

    const infoTitle = this.languageService.translate.instant('informations');
    const geometryTitle = this.languageService.translate.instant('geometry.geometry');

    return zip(infoFields$, geometryFields$)
      .pipe(
        map((fields: [FormField[], FormField[]]) => {
          return this.formService.form([], [
            this.formService.group({name: 'info', title: infoTitle}, fields[0]),
            this.formService.group({name: 'geometry', title: geometryTitle}, fields[1])
          ]);
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
        geometryType: new BehaviorSubject<string>(undefined),
        geometryTypeField: false,
        drawStyle: createOlEditionStyle(),
        drawGuideField: true,
        drawGuide: undefined,
        drawGuidePlaceholder: 'Guide d\'aide au traçage',
        measure: true
      }
    }, partial));
  }

  private createTypeElementField(
    schemaType: string,
    partial?: Partial<FormFieldConfig>
  ): Observable<FormField<FormFieldSelectInputs>> {

    return this.getTypeElementChoices(schemaType)
      .pipe(
        map((choices: FormFieldSelectChoice[]) => {
          return this.createField({
            name: 'properties.typeElement',
            title: 'Type d\'élément',
            type: 'select',
            options:  {
              cols: 1,
              validator: Validators.required
            },
            inputs: {
              choices: new BehaviorSubject(choices)
            }
          }, partial) as FormField<FormFieldSelectInputs>;
        })
      );
  }

  private createField(config: FormFieldConfig, partial?: Partial<FormFieldConfig>): FormField {
    config = this.formService.extendFieldConfig(config, partial || {});
    return this.formService.field(config);
  }

  private getTypeElementChoices(schemaType: string): Observable<ClientSchemaElementType[]> {
    return this.schemaElementService.getSchemaElementTypes(schemaType).pipe(
      map((schemaElementTypes: ClientSchemaElementTypes) => {
        return Object.entries(schemaElementTypes)
          .reduce((acc: ClientSchemaElementType[], entries: [string, ClientSchemaElementType[]]) => {
            const [geometryType, types] = entries;
            const choices = types.map((type: ClientSchemaElementType) => {
              return Object.assign({}, type, {geometryType});
            });
            return acc.concat(choices);
          }, [])
          .sort((v1: ClientSchemaElementType, v2: ClientSchemaElementType) => {
            return ObjectUtils.naturalCompare(
              v1.title,
              v2.title,
              'asc'
            );
          });
      })
    );
  }


}
