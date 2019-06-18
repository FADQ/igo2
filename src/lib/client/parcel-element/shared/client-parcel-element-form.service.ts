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
      this.createNoParcelField(),
      this.createStatutAugmField(),
      this.createParcelleDraineeField(),
      this.createSourceParcelleField(),
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
      this.createSourceParcelleField({options: {disabled: true, disableSwitch: true}}),
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
        validator: Validators.maxLength(3),
        // errors: {
        //   maxlength: 'client.parcelElement.error.descriptionMaxLength'
        // }
      }
    }, partial));
  }

  private createStatutAugmField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.statutAugmentationSupCultivable',
      title: 'Statut de déboisement',
      type: 'select',
      options:  {
        cols: 1
      },
      inputs: {
        choices: []
      }
    }, partial));
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
        choices: [
          {value: 'inconnue', title: 'Inconnu'},
          {value: 'oui', title: 'Oui'},
          {value: 'non', title: 'Non'}
        ]
      }
    }, partial));
  }

  private createSourceParcelleField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.sourceParcelleAgricole',
      title: 'Source parcelle',
      type: 'select',
      options:  {
        cols: 1
      },
      inputs: {
        choices: []
      }
    }, partial));
  }

  private createAnneeImageField(partial?: Partial<FormFieldConfig>): Observable<FormField> {
    return of(this.createField({
      name: 'properties.anneeImage',
      title: 'Année d\image',
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
      title: 'Info locateur',
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
}
