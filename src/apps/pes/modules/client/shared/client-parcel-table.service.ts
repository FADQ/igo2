import { Injectable} from '@angular/core';

import { EntityTableTemplate, EntityTableColumnRenderer } from '@igo2/common';

import { formatDate } from 'src/lib/utils/date';
import { ClientInfoService, ClientParcel, padClientNum } from 'src/lib/client';

/**
 * This is a factory for parcel workspace table template
 */
@Injectable({
  providedIn: 'root'
})
export class ClientParcelTableService {

  constructor(private clientInfoService: ClientInfoService) {}

  /**
   * Create a table template
   * @returns Table template
   */
  buildTable(): EntityTableTemplate {
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
            const value = parcel.properties.noClientDetenteur;
            if (!value) { return ''; }
            if (value === parcel.properties.noClientRecherche) { return value; }
            return this.computeClientNumAnchor(value);
          }
        },
        {
          name: 'properties.noClientExploitant',
          title: 'Autre exploitant',
          renderer: EntityTableColumnRenderer.UnsanitizedHTML,
          valueAccessor: (parcel: ClientParcel) => {
            const value = parcel.properties.noClientExploitant;
            if (!value) { return ''; }
            if (value === parcel.properties.noClientRecherche) { return value; }
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
          name: 'properties.codeDefaultCultural',
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
          name: 'properties.parcelleDrainee',
          title: 'Drainage source FADQ'
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
