import { Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

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
import { FeatureStore, IgoMap } from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';
import { getMapExtentPolygon } from '../../../map';

import { createOlEditionStyle } from '../../../edition/shared/edition.utils';

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { validateOnlyOneLabel } from './client-schema-element-validators';
import {
  ClientSchemaElement,
  ClientSchemaElementType,
  ClientSchemaElementTypes
} from './client-schema-element.interfaces';
import { ClientSchemaElementService } from './client-schema-element.service';
import { UniqueClientSchemaType } from '../../schema/shared/client-schema.enums';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementFormService {

  constructor(
    private formService: FormService,
    private languageService: LanguageService,
    private schemaElementService: ClientSchemaElementService
  ) {}

  buildCreateForm(schema: ClientSchema, igoMap: IgoMap, store: FeatureStore<ClientSchemaElement>): Observable<Form> {
    // TODO: i18n
    const infoFields$ = zip(
      this.createIdField({options: {disabled: true}}),
      this.createTypeElementField(schema.type),
      this.createDescriptionField(),
      this.createEtiquetteField(),
      this.createAnneeImageField(igoMap)
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
            this.formService.group({name: 'info', title: infoTitle, options: {
              validator: Validators.compose([,
                (control: FormGroup) => validateOnlyOneLabel(control, store, schema)
              ])
            }}, fields[0]),
            this.formService.group({name: 'geometry', title: geometryTitle}, fields[1])
          ]);
        })
      );
  }

  buildUpdateForm(schema: ClientSchema, igoMap: IgoMap, store: FeatureStore<ClientSchemaElement>): Observable<Form> {
    return this.buildCreateForm(schema, igoMap, store);
  }

  buildUpdateBatchForm(igoMap: IgoMap, schema: ClientSchema, store: FeatureStore<ClientSchemaElement>): Observable<Form> {
    if (schema.type in UniqueClientSchemaType) {
      return this.buildUpdateBatchFormUniqueClientSchema(igoMap, schema);
    }

    const infoFields$ = zip(
      this.createTypeElementField(schema.type,{options: {disabled: true, disableSwitch: true}}),
      this.createDescriptionField({options: {disabled: true, disableSwitch: true}}),
      this.createEtiquetteField({options: {disabled: true, disableSwitch: true}}),
      this.createAnneeImageField(igoMap,{options: {disabled: true, disableSwitch: true}})
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

  private buildUpdateBatchFormUniqueClientSchema(igoMap: IgoMap, schema: ClientSchema): Observable<Form> {
    const infoFields$ = zip(
      this.createTypeElementField(schema.type,{options: {disabled: true, disableSwitch: true}}),
      this.createDescriptionField({options: {disabled: true, disableSwitch: true}}),
      this.createAnneeImageField(igoMap, {options: {disabled: true, disableSwitch: true}})
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
      title: 'Description ou commentaire',
      options:  {
        cols: 2,
        validator: Validators.maxLength(1500),
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
          maxlength: 'client.schemaElement.error.etiquetteMaxLength',
          uniqueLabel: 'client.schemaElement.error.uniqueLabel'
        }
      }
    }, partial));
  }

  private createAnneeImageField(igoMap: IgoMap, partial?: Partial<FormFieldConfig>): Observable<FormField> {
    const extentGeometry = getMapExtentPolygon(igoMap, 'EPSG:4326');
    return this.schemaElementService.getMostRecentImageYear(extentGeometry)
      .pipe(
        map((reponse: any) => {
          const lastYear:number = reponse.data;
          return this.createField({
            name: 'properties.anneeImage',
            title: 'Année d\'image',
            options:  {
              cols: 1,
              validator: Validators.compose([,
                Validators.pattern(/(19|20)\d{2}/),
                Validators.min(2000),
                Validators.max(lastYear)
              ]),
              errors: {
                pattern: 'errors.invalidAnnee',
                min: 'errors.imageYearWrongRange',
                max: 'errors.imageYearWrongRange'
              }
            }
          }, partial);
        })
      );
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
        measure: false,
        controlOptions: {
          translate: false
        }
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
              v1.order,
              v2.order,
              'asc'
            );
          });
      })
    );
  }

  /*private getImageYearChoices(firstYear: number, lastYear: number): FormFieldSelectChoice[] {
    const years = []
    if (lastYear === null || lastYear === undefined) { lastYear = new Date().getFullYear(); }
    // Add null value
    years.push({value:null, title: ''});
    for (var i = lastYear; i >= firstYear; i--) {
      //console.log('Année: ' + i.toString())
      years.push({value:i, title: i})
    }
    return years;
  }*/
}
