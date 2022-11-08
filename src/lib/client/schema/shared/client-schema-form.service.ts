import { Injectable, Inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { Observable, of, zip } from 'rxjs';
import { map} from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  EntityStore,
  Form,
  FormField,
  FormFieldConfig,
  FormFieldSelectChoice,
  FormFieldSelectInputs,
  FormService
} from '@igo2/common';

import { ApiService } from '../../../core/api/api.service';
import { DomainService } from '../../../core/domain/domain.service';

import {
  validateOnlyOneType
} from './client-schema-validators';
import {
  ClientSchema,
  ClientSchemaApiConfig
} from './client-schema.interfaces';
import { ClientSchemaType } from './client-schema.enums';

@Injectable()
export class ClientSchemaFormService {

  constructor(
    private formService: FormService,
    private apiService: ApiService,
    private domainService: DomainService,
    private languageService: LanguageService,
    @Inject('clientSchemaApiConfig') private apiConfig: ClientSchemaApiConfig
  ) {}

  buildCreateForm(store: EntityStore<ClientSchema>): Observable<Form> {
    // TODO: i18n
    const fields$ = zip(
      this.createIdField({options: {disabled: true}}),
      this.createTypeField(),
      this.createDescriptionField(),
      this.createAnneeField()
    );
    return fields$.pipe(
      map((fields: FormField[]) => {
        return this.formService.form([], [
          this.formService.group({
            name: 'info',
            options: {
              validator: Validators.compose([
                (control: FormGroup) => validateOnlyOneType(control, store)
              ])
            }
          }, fields)
        ]);
      })
    );
  }

  buildUpdateForm(store: EntityStore<ClientSchema>): Observable<Form> {
    const fields$ = zip(
      this.createIdField({options: {disabled: true}}),
      this.createTypeField({options: {disabled: true}}),
      this.createDescriptionField(),
      this.createAnneeField()
    );
    return fields$.pipe(
      map((fields: FormField[]) => {
        return this.formService.form([], [
          this.formService.group({
            name: 'info',
            options: {
              validator: Validators.compose([,
                (control: FormGroup) => validateOnlyOneType(control, store)
              ])
            }
          }, fields)
        ]);
      })
    );
  }

  buildTransferForm(): Observable<Form> {
    const fields$ = zip(
      this.createNumeroClientField()
    );
    return fields$.pipe(
      map((fields: FormField[]) => {
        return this.formService.form([], [
          this.formService.group({name: 'info'}, fields)
        ]);
      })
    );
  }

  private createIdField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'id',
      title: 'Numéro de schéma',
      options:  {
        cols: 1
      }
    }, partial));
  }

  private createNumeroClientField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'numeroClient',
      title: 'Client pour transfert',
      options:  {
        cols: 2,
        validator: Validators.required
      }
    }, partial));
  }

  private createTypeField(
    partial?: Partial<FormFieldConfig>
  ): Observable<FormField<FormFieldSelectInputs>> {

    return this.getClientSchemaTypeChoices()
      .pipe(
        map((choices: FormFieldSelectChoice[]) => {
          return this.createField({
            name: 'type',
            title: 'Type de schéma',
            type: 'select',
            options:  {
              cols: 1,
              validator: Validators.compose([
                Validators.required
              ]),
              errors: {
                onlyOneLSE: 'client.schema.error.onlyOneLSE',
                onlyOneRPA: 'client.schema.error.onlyOneRPA'
              }
            },
            inputs: {
              choices
            }
          }, partial) as FormField<FormFieldSelectInputs>;
        })
      );
  }

  private createDescriptionField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'description',
      title: 'Description',
      options:  {
        cols: 2,
        validator: Validators.required
      }
    }, partial));
  }

  private createAnneeField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'annee',
      title: 'Année',
      options:  {
        cols: 2,
        validator: Validators.compose([Validators.required,Validators.pattern(/^([1-9][\d]{3})$/)])
      }
    }, partial));
  }

  private createField(config: FormFieldConfig, partial?: Partial<FormFieldConfig>): FormField {
    config = this.formService.extendFieldConfig(config, partial || {});
    return this.formService.field(config);
  }

  private getClientSchemaTypeChoices(): Observable<FormFieldSelectChoice[]> {
    const url = this.apiService.buildUrl(this.apiConfig.domains.type);
    return this.domainService.getChoices(url);
  }

}
