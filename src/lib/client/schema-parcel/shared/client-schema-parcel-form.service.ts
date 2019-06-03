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

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElementFormService } from '../../schema-element/shared/client-schema-element-form.service';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaParcelFormService {

  constructor(
    private formService: FormService,
    private languageService: LanguageService,
    private clientSchemaElementFormService: ClientSchemaElementFormService
  ) {}

  buildCreateForm(schema: ClientSchema, igoMap: IgoMap): Observable<Form> {
    const parcelFields$ = zip(
      this.createNoParcelField()
    );

    const schemaElementForm$ = this.clientSchemaElementFormService.buildCreateForm(schema, igoMap);

    return zip(schemaElementForm$, parcelFields$)
      .pipe(
        map((entries: [Form, FormField[]]) => {
          const [form, parcelFields] = entries;
          const parcelGroup = this.formService.group({name: 'parcel'}, parcelFields);
          form.groups.push(parcelGroup);
          return form;
        })
      );
  }

  buildUpdateForm(schema: ClientSchema, igoMap: IgoMap): Observable<Form> {
    return this.buildCreateForm(schema, igoMap);
  }

  private createNoParcelField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.noParcelleAgricole',
      title: 'Numéro de parcelle',
      options:  {
        cols: 1,
        validator: Validators.maxLength(3),
        // errors: {
        //   maxlength: 'client.schemaElement.error.descriptionMaxLength'
        // }
      }
    }, partial));
  }

  private createField(config: FormFieldConfig, partial?: Partial<FormFieldConfig>): FormField {
    config = this.formService.extendFieldConfig(config, partial || {});
    return this.formService.field(config);
  }
}
