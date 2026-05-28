import { Injectable } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';

import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core/language';
import {
  Form,
  FormField,
  FormFieldConfig,
  FormFieldSelectInputs,
  FormService,
  FormFieldSelectChoice
} from '@igo2/common/form';

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

  // -------------------------------------------------------------------------
  // CREATE FORM
  // -------------------------------------------------------------------------
  buildCreateForm(
    schema: ClientSchema,
    igoMap: IgoMap,
    store: FeatureStore<ClientSchemaElement>
  ): Observable<Form> {

    const infoFields$ = forkJoin([
      this.createIdField({ options: { disabled: true } }),
      this.createTypeElementField(schema.type),
      this.createDescriptionField(),
      this.createEtiquetteField(),
      this.createAnneeImageField(igoMap, { options: { disabled: true } })
    ]);

    const geometryFields$ = forkJoin([
      this.createGeometryField({
        inputs: { map: igoMap }
      })
    ]);

    const infoTitle =
      this.languageService.translate.instant('informations');

    const geometryTitle =
      this.languageService.translate.instant('geometry.geometry');

    return forkJoin([infoFields$, geometryFields$]).pipe(
      map(([infoFields, geometryFields]: [FormField[], FormField[]]) => {

        // 🔥 FIX IMPORTANT : on NE DOIT PAS passer []
        const allFields = [...infoFields, ...geometryFields];

        return this.formService.form(
          allFields,
          [
            this.formService.group(
              {
                name: 'info',
                title: infoTitle,
                options: {
                  validator: (control: AbstractControl) =>
                    validateOnlyOneLabel(control, store, schema)
                }
              },
              infoFields
            ),

            this.formService.group(
              {
                name: 'geometry',
                title: geometryTitle
              },
              geometryFields
            )
          ]
        );
      })
    );
  }

  // -------------------------------------------------------------------------
  // UPDATE BATCH FORM
  // -------------------------------------------------------------------------
  buildUpdateBatchForm(
    igoMap: IgoMap,
    schema: ClientSchema,
    store: FeatureStore<ClientSchemaElement>
  ): Observable<Form> {

    // 🔥 CAS SPÉCIAL : schéma unique
    if (schema.type in UniqueClientSchemaType) {
      return this.buildUpdateBatchFormUniqueClientSchema(igoMap, schema);
    }

    const infoFields$ = forkJoin([
      this.createTypeElementField(schema.type, {
        options: { disabled: true, disableSwitch: true }
      }),
      this.createDescriptionField({
        options: { disabled: true, disableSwitch: true }
      }),
      this.createEtiquetteField({
        options: { disabled: true, disableSwitch: true }
      })
    ]);

    const infoTitle =
      this.languageService.translate.instant('informations');

    return infoFields$.pipe(
      map((fields: FormField[]) => {

        return this.formService.form(
          fields,
          [
            this.formService.group(
              {
                name: 'info',
                title: infoTitle
              },
              fields
            )
          ]
        );
      })
    );
  }

  // -------------------------------------------------------------------------
  // FIELD BUILDERS
  // -------------------------------------------------------------------------

  private createIdField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.idElementGeometrique',
      title: 'ID',
      options: { cols: 1 }
    }, partial));
  }

  private createDescriptionField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.description',
      title: 'Description ou commentaire',
      options: {
        cols: 2,
        validator: Validators.maxLength(1500)
      }
    }, partial));
  }

  private createEtiquetteField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.etiquette',
      title: 'Étiquette',
      options: {
        cols: 1,
        validator: Validators.maxLength(25)
      }
    }, partial));
  }

  private createAnneeImageField(
    igoMap: IgoMap,
    partial?: Partial<FormFieldConfig>
  ): Observable<FormField> {

    const extent = getMapExtentPolygon(igoMap, 'EPSG:4326');

    return this.schemaElementService
      .getMostRecentImageYear(extent as any)
      .pipe(
        map((response: any) => {

          const lastYear: number = response.data;

          return this.createField({
            name: 'properties.anneeImage',
            title: "Année d'image",
            options: {
              cols: 1,
              validator: Validators.compose([
                Validators.pattern(/(19|20)\d{2}/),
                Validators.min(2000),
                Validators.max(lastYear)
              ])
            }
          }, partial);
        })
      );
  }

  private createGeometryField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'geometry',
      title: 'Géométrie',
      type: 'geometry',
      options: {
        cols: 2,
        validator: (control: AbstractControl) => {

          const value = control.value;

          if (!value || !value.type || !value.coordinates) {
            return { required: true };
          }

          // Vérifie qu’il y a au moins une coordonnée
          if (!Array.isArray(value.coordinates) || value.coordinates.length === 0) {
            return { required: true };
          }

          return null; // ✅ valide
        }

      },
      inputs: {
        geometryType: new BehaviorSubject<string | undefined>(undefined),
        geometryTypeField: false,
        drawStyle: createOlEditionStyle(),
        drawGuideField: true,
        drawGuide: undefined,
        measure: false
      }
    }, partial));
  }

  private createTypeElementField(
    schemaType: string,
    partial?: Partial<FormFieldConfig>
  ): Observable<FormField<FormFieldSelectInputs>> {

    return this.getTypeElementChoices(schemaType).pipe(
      map((choices: FormFieldSelectChoice[]) => {

        return this.createField({
          name: 'properties.typeElement',
          title: "Type d'élément",
          type: 'select',
          options: {
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

  // -------------------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------------------

  private createField(
    config: FormFieldConfig,
    partial?: Partial<FormFieldConfig>
  ): FormField {

    const merged =
      this.formService.extendFieldConfig(config, partial || {});

    return this.formService.field(merged);
  }

  private getTypeElementChoices(
    schemaType: string
  ): Observable<ClientSchemaElementType[]> {

    return this.schemaElementService.getSchemaElementTypes(schemaType).pipe(
      map((schemaElementTypes: ClientSchemaElementTypes) => {

        return Object.entries(schemaElementTypes)
          .reduce((acc: ClientSchemaElementType[],
            [geometryType, types]: [string, ClientSchemaElementType[]]) => {

            const enriched = types.map((t: ClientSchemaElementType) => ({
              ...t,
              geometryType
            }));

            return [...acc, ...enriched];
          }, [])
          .sort((a: ClientSchemaElementType, b: ClientSchemaElementType) =>
            ObjectUtils.naturalCompare(a.order, b.order, 'asc')
          );
      })
    );
  }

  buildUpdateForm(
    schema: ClientSchema,
    igoMap: IgoMap,
    store: FeatureStore<ClientSchemaElement>
  ): Observable<Form> {

    return this.buildCreateForm(schema, igoMap, store);
  }

  private buildUpdateBatchFormUniqueClientSchema(
    igoMap: IgoMap,
    schema: ClientSchema
  ): Observable<Form> {

    const infoFields$ = forkJoin([
      this.createTypeElementField(schema.type, {
        options: { disabled: true, disableSwitch: true }
      }),
      this.createDescriptionField({
        options: { disabled: true, disableSwitch: true }
      })
    ]);

    const infoTitle =
      this.languageService.translate.instant('informations');

    return infoFields$.pipe(
      map((fields: FormField[]) => {

        return this.formService.form(
          fields,
          [
            this.formService.group(
              {
                name: 'info',
                title: infoTitle
              },
              fields
            )
          ]
        );
      })
    );
  }
}
