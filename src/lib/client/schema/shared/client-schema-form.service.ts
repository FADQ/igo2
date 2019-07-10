import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, Validators } from '@angular/forms';

import { Observable, of, zip } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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

import { ApiService } from 'src/lib/core/api';

import {
  validateOnlyOneLSE,
  validateEtatEPA,
  validateAnnee
} from './client-schema-validators';
import {
  ClientSchema,
  ClientSchemaApiConfig,
  ClientSchemaTypeChoicesResponse,
  ClientSchemaEtatChoicesResponse
} from './client-schema.interfaces';

@Injectable()
export class ClientSchemaFormService {

  private clientSchemaTypeChoices: FormFieldSelectChoice[];
  private clientSchemaEtatChoices: FormFieldSelectChoice[];

  constructor(
    private formService: FormService,
    private http: HttpClient,
    private apiService: ApiService,
    private languageService: LanguageService,
    @Inject('clientSchemaApiConfig') private apiConfig: ClientSchemaApiConfig
  ) {}

  buildCreateForm(store: EntityStore<ClientSchema>): Observable<Form> {
    const fields$ = zip(
      this.createIdField({options: {disabled: true}}),
      this.createTypeField(),
      this.createDescriptionField(),
      this.createAnneeField(),
      this.createEtatField()
    );
    return fields$.pipe(
      map((fields: FormField[]) => {
        return this.formService.form([], [
          this.formService.group({
            name: 'info',
            options: {
              validator: Validators.compose([
                (control: FormGroup) => validateEtatEPA(control, store),
                (control: FormGroup) => validateAnnee(control),
                (control: FormGroup) => validateOnlyOneLSE(control, store)
              ])
            }
          }, fields)
        ]);
      })
    );
  }

  buildUpdateForm(store: EntityStore<ClientSchema>): Observable<Form> {
    return this.buildCreateForm(store);
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
                onlyOneLSE: 'client.schema.error.onlyOneLSE'
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
        cols: 1,
        validator: Validators.pattern(/^([1-9][\d]{3})$/),
        errors: {
          required: 'client.schema.error.anneeRequired',
          pattern: 'errors.invalidAnnee'
        }
      }
    }, partial));
  }

  private createEtatField(
    partial?: Partial<FormFieldConfig>
  ): Observable<FormField<FormFieldSelectInputs>> {

    return this.getClientSchemaEtatChoices()
      .pipe(
        map((choices: FormFieldSelectChoice[]) => {
          return this.createField({
            name: 'etat',
            title: 'État de schéma',
            type: 'select',
            options:  {
              cols: 1,
              errors: {
                etatRequiredByEPA: 'client.schema.error.etatRequiredByEPA',
                onlyOneEPA: 'client.schema.error.onlyOneEPA'
              }
            },
            inputs: {
              choices
            }
          }, partial) as FormField<FormFieldSelectInputs>;
        })
      );
  }

  private createField(config: FormFieldConfig, partial?: Partial<FormFieldConfig>): FormField {
    config = this.formService.extendFieldConfig(config, partial || {});
    return this.formService.field(config);
  }

  private getClientSchemaTypeChoices(): Observable<FormFieldSelectChoice[]> {
    if (this.clientSchemaTypeChoices !== undefined) {
      return of(this.clientSchemaTypeChoices);
    }

    const url = this.apiService.buildUrl(this.apiConfig.domains.type);
    return this.http
      .get(url)
      .pipe(
        map((response: ClientSchemaTypeChoicesResponse) => {
          return this.extractSchemaTypeChoicesFromResponse(response);
        }),
        tap((choices: FormFieldSelectChoice[]) => {
          this.cacheClientSchemaTypeChoices(choices);
        })
      );
  }

  private extractSchemaTypeChoicesFromResponse(
    response: ClientSchemaTypeChoicesResponse
  ): FormFieldSelectChoice[] {
    const items = response.data || [];
    return items.map(item => Object.create({
      value: item.code,
      title: item.descriptionAbregeeFrancais
    }));
  }

  private cacheClientSchemaTypeChoices(choices: FormFieldSelectChoice[]) {
    this.clientSchemaTypeChoices = choices;
  }

  private getClientSchemaEtatChoices(): Observable<FormFieldSelectChoice[]> {
    if (this.clientSchemaEtatChoices !== undefined) {
      return of(this.clientSchemaEtatChoices);
    }

    const url = this.apiService.buildUrl(this.apiConfig.domains.etat);
    return this.http
      .get(url)
      .pipe(
        map((response: ClientSchemaEtatChoicesResponse) => {
          return [{value: undefined, title: ''}].concat(
            this.extractSchemaEtatChoicesFromResponse(response)
          );
        }),
        tap((choices: FormFieldSelectChoice[]) => {
          this.cacheClientSchemaEtatChoices(choices);
        })
      );
  }

  private extractSchemaEtatChoicesFromResponse(
    response: ClientSchemaEtatChoicesResponse
  ): FormFieldSelectChoice[] {
    const items = response.data || [];
    return items.map(item => Object.create({
      value: item.code,
      title: item.descriptionAbregeeFrancais
    }));
  }

  private cacheClientSchemaEtatChoices(choices: FormFieldSelectChoice[]) {
    this.clientSchemaEtatChoices = choices;
  }
}
