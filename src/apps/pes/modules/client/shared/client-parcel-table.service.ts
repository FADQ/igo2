import { Injectable} from '@angular/core';

import { EntityTableTemplate } from '@igo2/common/entity';
import { formatMeasure } from '@igo2/geo';
import { formatDate } from 'src/lib/utils/date';
import { ClientParcel } from 'src/lib/client';
import { typedRowClass } from '@lib/compatibility/typedAccessor';

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
      tableHeight: '100%',
      headerClassFunc: (() => {
        return {'text-centered': true};
      }),
      rowClassFunc: typedRowClass<ClientParcel>(() => {
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
          valueAccessor: (entity: Object) => {
            const parcelElement = entity as ClientParcel;
            const area = parcelElement.properties.superficieHectare;
            return area ? formatMeasure(area, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.superficieAcre',
          title: 'Superficie mesurée (ac)',
          valueAccessor: (entity: Object) => {
            const parcelElement = entity as ClientParcel;
            const area = parcelElement.properties.superficieHectare;
            return area ? formatMeasure(area*2.471, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.superficieArpent',
          title: 'Superficie mesurée (ar)',
          valueAccessor: (entity: Object) => {
            const parcelElement = entity as ClientParcel;
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
          valueAccessor: (entity: Object) => {
            const parcel = entity as ClientParcel;
            const value = parcel.properties.timbreMajGeometrie;
            if (!value) { return ''; }
            return formatDate(value);
          }
        }
      ]
    };
  }
}
