import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

import { Observable, of, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  Form,
  FormField,
  FormFieldConfig,
  FormService
} from '@igo2/common';
import { IgoMap } from '@igo2/geo';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelElementFormService {

  constructor(
    private formService: FormService,
    private languageService: LanguageService,
    private clientParcelElementFormService: ClientParcelElementFormService
  ) {}

  buildCreateForm(igoMap: IgoMap): Observable<Form> {
    const geometryFields$ = zip(
      this.createGeometryField({inputs: {map: igoMap}})
    );

    const infoFields$ = zip(
      this.createIdField({options: {disabled: true}}),
      this.createNoParcelField(),
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
      )
  }

  buildUpdateForm(igoMap: IgoMap): Observable<Form> {
    return this.buildCreateForm(igoMap);
  }

  private createIdField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.id',
      title: 'ID',
      options:  {
        cols: 1
      }
    }, partial));
  }

  private createNoParcelField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.noParcelleAgricole',
      title: 'Numéro de parcelle',
      options:  {
        cols: 1,
        validator: Validators.maxLength(3),
        // errors: {
        //   maxlength: 'client.parcelElement.error.descriptionMaxLength'
        // }
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
        geometryType: 'Polygon',
        geometryTypeField: false,
        drawGuideField: true,
        drawGuide: 0,
        drawGuidePlaceholder: 'Guide d\'aide au traçage',
        measure: true
      }
    }, partial));
  }

  private createField(config: FormFieldConfig, partial?: Partial<FormFieldConfig>): FormField {
    config = this.formService.extendFieldConfig(config, partial || {});
    return this.formService.field(config);
  }
}
