import { Injectable, Inject } from '@angular/core';
import { Validators } from '@angular/forms';

import { BehaviorSubject, Observable, of, zip } from 'rxjs';
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
import { ClientParcelProCategories } from './client-parcel-pro.enums';

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
      this.createCategoryField(),
      this.createProductionField(),
      this.createCultivarField(),
      this.createMultiProductionField()
    ).pipe(
      map((fields: FormField[]) => {
        return this.formService.form(fields, []);
      })
    );
  }

  buildUpdateBatchForm(): Observable<Form> {
    return zip(
      this.createCategoryField(),
      this.createProductionField(),
      this.createCultivarField(),
      this.createMultiProductionField()
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

  private createCategoryField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return this.getCategoryChoices()
      .pipe(
        map((choices: FormFieldSelectChoice[]) => {
          return this.createField({
            name: 'properties.category',
            title: 'Category',
            type: 'select',
            options:  {
              cols: 2
            },
            inputs: {
              choices
            }
          }, partial)  as FormField<FormFieldSelectInputs>;
        })
      );
  }

  private createProductionField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.production',
      title: 'Production',
      type: 'select',
      options:  {
        cols: 2
      },
      inputs: {
        choices: new BehaviorSubject([])
      }
    }, partial));
  }

  private createCultivarField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.cultivar',
      title: 'Cultivar',
      type: 'select',
      options:  {
        cols: 2
      },
      inputs: {
        choices: new BehaviorSubject([])
      }
    }, partial));
  }

  private createMultiProductionField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.multiproduction',
      title: 'Productions multiples',
      type: 'select',
      options:  {
        cols: 2
      },
      inputs: {
        value: 0,
        choices:  [{value: 0, title: 'Non'}, {value: 1, title: 'Oui'}]
      }
    }, partial));
  }

  private createField(config: FormFieldConfig, partial?: Partial<FormFieldConfig>): FormField {
    config = this.formService.extendFieldConfig(config, partial || {});
    return this.formService.field(config);
  }

  private getCategoryChoices(): Observable<FormFieldSelectChoice[]> {
    // const url = this.apiService.buildUrl(this.apiConfig.domains.pro);
    // return this.domainService.getChoices(url).pipe(
    //   map((choices: FormFieldSelectChoice[]) => [{value: null, title: ''}].concat(choices))
    // );

    const choices = [{value: null, title: ''}].concat(
      Object.keys(ClientParcelProCategories)
        .sort()
        .map((key: string) => {
          const category = ClientParcelProCategories[key];
          return {value: key, title: category.desc};
        })
      );

    return of(choices);
  }
}
