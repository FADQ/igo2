import { Injectable} from '@angular/core';

import { EntityTableTemplate } from '@igo2/common';
import { formatMeasure } from '@igo2/geo';
import { formatDate } from 'src/lib/utils/date';
import { ClientParcel } from 'src/lib/client';

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
          title: 'Superficie mesurée (ha)',
          valueAccessor: (parcelElement: ClientParcel) => {
            const area = parcelElement.properties.superficieHectare;
            return area ? formatMeasure(area, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.superficieAcre',
          title: 'Superficie mesurée (ac)',
          valueAccessor: (parcelElement: ClientParcel) => {
            const area = parcelElement.properties.superficieHectare;
            return area ? formatMeasure(area*2.471, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.superficieArpent',
          title: 'Superficie mesurée (ar)',
          valueAccessor: (parcelElement: ClientParcel) => {
            const area = parcelElement.properties.superficieHectare;
            return area ? formatMeasure(area*2.924, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.pourcentageSupMao',
          title: '% d’exploitation de la production'
        },
        {
          name: 'properties.superficieMao',
          title: 'Superficie calculée selon le % (ha)'
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
          title: 'Statut IASC'
        },
        {
          name: 'properties.timbreMajGeometrie',
          title: 'Date de mise à jour de la géométrie',
          valueAccessor: (parcel: ClientParcel) => {
            const value = parcel.properties.timbreMajGeometrie;
            if (!value) { return ''; }
            return formatDate(value);
          }
        }
      ]
    };
  }
}
