import { Injectable} from '@angular/core';

import {
  EntityTableTemplate,
  EntityTableColumnRenderer,
  FormFieldSelectChoice
} from '@igo2/common';

import { formatDate } from 'src/lib/utils/date';
import {
  ClientInfoService,
  ClientParcel,
  padClientNum,
  getParcelleDraineeChoices
} from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelTableService {

  constructor(private clientInfoService: ClientInfoService) {}

  buildTable(): EntityTableTemplate {
    // TODO: i18n
    return {
      selection: true,
      selectionCheckbox: true,
      selectMany: true,
      sort: true,
      fixedHeader: true,
      headerClassFunc: (() => {
        return {'text-centered': true};
      }),
      rowClassFunc: ((parcel: ClientParcel) => {
        return {'text-centered': true};
      }),
      columns: [
        {
          name: 'properties.noParcelleAgricole',
          title: 'Numéro de parcelle'
        },
        {
          name: 'properties.noDiagramme',
          title: 'Numéro de diagramme'
        },
        {
          name: 'properties.noClientDetenteur',
          title: 'Autre détenteur',
          renderer: EntityTableColumnRenderer.UnsanitizedHTML,
          valueAccessor: (parcel: ClientParcel) => {
            const value = parcel.properties.autreDetenteur;
            if (!value) { return ''; }
            return this.computeClientNumAnchor(value);
          }
        },
        {
          name: 'properties.noClientExploitant',
          title: 'Autre exploitant',
          renderer: EntityTableColumnRenderer.UnsanitizedHTML,
          valueAccessor: (parcel: ClientParcel) => {
            const value = parcel.properties.autreExploitant;
            if (!value) { return ''; }
            return this.computeClientNumAnchor(value);
          }
        },
        {
          name: 'properties.infoLocateur',
          title: 'Information localisation'
        },
        {
          name: 'properties.production',
          title: 'Code de production'
        },
        {
          name: 'properties.descriptionProduction',
          title: 'Description de production'
        },
        {
          name: 'properties.superficie',
          title: 'Superficie mesurée (m²)'
        },
        {
          name: 'properties.superficieHectare',
          title: 'Superficie mesurée (ha)'
        },
        {
          name: 'properties.pourcentageSupMao',
          title: 'Superficie (%)'
        },
        {
          name: 'properties.superficieMao',
          title: 'Superficie mesurée selon % (ha)'
        },
        {
          name: 'properties.superficieDeclaree',
          title: 'Superficie déclarée IVEG (ha)'
        },
        {
          name: 'properties.codeDefautCultural',
          title: 'Code de défaut cultural'
        },
        {
          name: 'properties.pourcentageDefautCultural',
          title: 'Défaut cultural (%)'
        },
        {
          name: 'properties.noConfirmation',
          title: 'Numéro de confirmation IVEG'
        },
        {
          name: 'properties.statutAugmentationSupCultivable',
          title: 'Statut de déboisement'
        },
        {
          name: 'properties.indParcelleDrainee',
          title: 'Drainage source FADQ',
          valueAccessor: (parcel: ClientParcel) => {
            const value = parcel.properties.indParcelleDrainee;
            const choices = getParcelleDraineeChoices();
            const choice = choices.find((_choice: FormFieldSelectChoice) => _choice.value === value);
            return choice ? choice.title : '';
          }
        },
        {
          name: 'properties.sourceParcelleAgricole',
          title: 'Référence de la mesure'
        },
        {
          name: 'properties.timbreMajGeometrie',
          title: 'Date de mise à jour',
          valueAccessor: (parcel: ClientParcel) => {
            const value = parcel.properties.timbreMajGeometrie;
            if (!value) { return ''; }
            return formatDate(value);
          }
        }
      ]
    };
  }

  private computeClientNumAnchor(clientNum: string): string {
    const link = this.clientInfoService.getClientInfoLink(padClientNum(clientNum));
    const onClick = `window.open('${link}', 'Client', 'width=800, height=600'); return false;`;
    return `<a target="popup" href="${link}" onClick="${onClick}">${clientNum}</a>`;
  }
}
