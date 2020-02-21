import { Injectable, Inject } from '@angular/core';
import { Validators } from '@angular/forms';

import { Observable, of, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  Form,
  FormField,
  FormFieldConfig,
  FormFieldSelectChoice,
  FormFieldSelectInputs,
  FormService
} from '@igo2/common';

import { ApiService } from '../../../core/api/api.service';
import { DomainService } from '../../../core/domain/domain.service';
import { ClientParcelProApiConfig } from './client-parcel-pro.interfaces';

@Injectable()
export class ClientParcelProFormService {

  constructor(
    private formService: FormService,
    private apiService: ApiService,
    private domainService: DomainService,
    private languageService: LanguageService,
    @Inject('clientParcelProApiConfig') private apiConfig: ClientParcelProApiConfig
  ) {}

  buildUpdateForm(): Observable<Form> {
    return zip(
      this.createNoParcelField({options: {disabled: true}}),
      this.createProdField()
    ).pipe(
      map((fields: FormField[]) => {
        return this.formService.form(fields, []);
      })
    );
  }

  buildUpdateBatchForm(): Observable<Form> {
    return zip(
      this.createProdField()
    ).pipe(
      map((fields: FormField[]) => {
        return this.formService.form(fields, []);
      })
    );
  }

  private createNoParcelField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.noParcelleAgricole',
      title: 'Numéro de parcelle',
      options:  {
        cols: 1,
        validator: Validators.maxLength(4)
      }
    }, partial));
  }

  private createProdField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return this.getProdChoices()
      .pipe(
        map((choices: FormFieldSelectChoice[]) => {
          return this.createField({
            name: 'properties.prod',
            title: 'Production',
            type: 'select',
            options:  {
              cols: 1
            },
            inputs: {
              choices
            }
          }, partial)  as FormField<FormFieldSelectInputs>;
        })
      );
  }

  private createField(config: FormFieldConfig, partial?: Partial<FormFieldConfig>): FormField {
    config = this.formService.extendFieldConfig(config, partial || {});
    return this.formService.field(config);
  }

  private getProdChoices(): Observable<FormFieldSelectChoice[]> {
    return of([
      {value: null, title: ''},
      {value: 'orge', title: 'Orge'}
    ])
  }
}
