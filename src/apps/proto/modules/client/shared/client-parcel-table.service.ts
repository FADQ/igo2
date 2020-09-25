import { Injectable} from '@angular/core';

import { EntityTableTemplate } from '@igo2/common';

import { formatDate } from 'src/lib/utils/date';
import { ClientParcelPro } from 'src/lib/client';

/**
 * This is a factory for parcel workspace table template
 */
@Injectable({
  providedIn: 'root'
})
export class ClientParcelTableService {

  constructor() {}

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
      rowClassFunc: ((parcel: ClientParcelPro) => {
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
          name: 'properties.timbreMajGeometrie',
          title: 'Date de mise à jour',
          valueAccessor: (parcel: ClientParcelPro) => {
            const value = parcel.properties.timbreMajGeometrie;
            if (!value) { return ''; }
            return formatDate(value);
          }
        }
      ]
    };
  }
}
