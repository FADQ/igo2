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
import { IgoMap } from '@igo2/geo';

import { ApiService } from 'src/lib/core/api';
import { DomainService } from 'src/lib/core/domain';

import { getParcelleDraineeChoices } from '../../parcel/shared/client-parcel.utils';
import { ClientParcelElementApiConfig } from './client-parcel-element.interfaces';

@Injectable()
export class ClientParcelElementFormService {

  constructor(
    private formService: FormService,
    private apiService: ApiService,
    private domainService: DomainService,
    private languageService: LanguageService,
    @Inject('clientParcelElementApiConfig') private apiConfig: ClientParcelElementApiConfig
  ) {}

  buildCreateForm(igoMap: IgoMap): Observable<Form> {
    const geometryFields$ = zip(
      this.createGeometryField({inputs: {map: igoMap}})
    );

    const infoFields$ = zip(
      this.createNoParcelField(),
      this.createStatutAugmField(),
      this.createParcelleDraineeField(),
      this.createSourceField(),
      this.createAnneeImageField(),
      this.createInfoLocateurField()
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
      );
  }

  buildUpdateForm(igoMap: IgoMap): Observable<Form> {
    return this.buildCreateForm(igoMap);
  }

  buildUpdateBatchForm(): Observable<Form> {
    const infoFields$ = zip(
      this.createNoParcelField({options: {disabled: true}}),
      this.createStatutAugmField({options: {disabled: true, disableSwitch: true}}),
      this.createParcelleDraineeField({options: {disabled: true, disableSwitch: true}}),
      this.createSourceField({options: {disabled: true, disableSwitch: true}}),
      this.createAnneeImageField({options: {disabled: true, disableSwitch: true}}),
      this.createInfoLocateurField({options: {disabled: true, disableSwitch: true}})
    );
    const infoTitle = this.languageService.translate.instant('informations');

    return infoFields$
      .pipe(
        map((fields:  FormField[]) => {
          return this.formService.form([], [
            this.formService.group({name: 'info', title: infoTitle}, fields)
          ]);
        })
      );
  }

  private createNoParcelField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.noParcelleAgricole',
      title: 'Numéro de parcelle',
      options:  {
        cols: 1,
        validator: Validators.maxLength(3)
      }
    }, partial));
  }

  private createStatutAugmField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return this.getStatutAugmChoices()
      .pipe(
        map((choices: FormFieldSelectChoice[]) => {
          return this.createField({
            name: 'properties.statutAugmentationSupCultivable',
            title: 'Statut de déboisement',
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

  private createParcelleDraineeField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.parcelleDrainee',
      title: 'Parcelle drainée',
      type: 'select',
      options:  {
        cols: 1
      },
      inputs: {
        choices: getParcelleDraineeChoices()
      }
    }, partial));
  }

  private createSourceField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return this.getSourceChoices()
      .pipe(
        map((choices: FormFieldSelectChoice[]) => {
          return this.createField({
            name: 'properties.sourceParcelleAgricole',
            title: 'Référence de la parcelle',
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

  private createInfoLocateurField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.infoLocateur',
      title: 'Info localisation',
      options:  {
        cols: 1
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
        drawGuide: undefined,
        drawGuidePlaceholder: 'Guide d\'aide au traçage',
        measure: true
      }
    }, partial));
  }

  private createField(config: FormFieldConfig, partial?: Partial<FormFieldConfig>): FormField {
    config = this.formService.extendFieldConfig(config, partial || {});
    return this.formService.field(config);
  }

  private getSourceChoices(): Observable<FormFieldSelectChoice[]> {
    const url = this.apiService.buildUrl(this.apiConfig.domains.source);
    return this.domainService.getChoices(url).pipe(
      map((choices: FormFieldSelectChoice[]) => [{value: null, title: ''}].concat(choices))
    );
  }

  private getStatutAugmChoices(): Observable<FormFieldSelectChoice[]> {
    const url = this.apiService.buildUrl(this.apiConfig.domains.statutAugm);
    return this.domainService.getChoices(url).pipe(
      map((choices: FormFieldSelectChoice[]) => [{value: null, title: ''}].concat(choices))
    );
  }
}
