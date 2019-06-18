import { Injectable} from '@angular/core';

import { EntityTableTemplate } from '@igo2/common';
import { formatMeasure, squareMetersToHectares } from '@igo2/geo';

import { formatDate } from 'src/lib/utils/date';
import { ClientParcelElement } from './client-parcel-element.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelElementTableService {

  buildTable(): EntityTableTemplate {
    return {
      selection: true,
      selectionCheckbox: true,
      selectMany: true,
      sort: true,
      headerClassFunc: (() => {
        return {'text-centered': true};
      }),
      rowClassFunc: ((parcelElement: ClientParcelElement) => {
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
          name: 'properties.superficie',
          title: 'Superficie mesurée (m²)',
          valueAccessor: (parcelElement: ClientParcelElement) => {
            const area = parcelElement.properties.superficie;
            return area ? formatMeasure(area, {decimal: 0, locale: 'fr'}) : '';
          }
        },
        {
          name: 'superficieHectares',
          title: 'Superficie mesurée (ha)',
          valueAccessor: (parcelElement: ClientParcelElement) => {
            const area = parcelElement.properties.superficie;
            return area ? formatMeasure(squareMetersToHectares(area), {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.statutAugmentationSupCultivable',
          title: 'Statut de déboisement'
        },
        {
          name: 'properties.parcelleDrainee',
          title: 'Drainage'
        },
        {
          name: 'properties.infoLocateur',
          title: 'Info locateur'
        },
        {
          name: 'properties.anneeImage',
          title: 'Année image'
        },
        {
          name: 'properties.sourceParcelleAgricole',
          title: 'Source parcelle agricole'
        },
        {
          name: 'properties.timbreMajGeometrie',
          title: 'Date de mise à jour',
          valueAccessor: (parcelElement: ClientParcelElement) => {
            const value = parcelElement.properties.timbreMajGeometrie;
            if (!value) { return ''; }
            return formatDate(value);
          }
        },
        {
          name: 'properties.usagerMajGeometrie',
          title: 'Utilisateur'
        },
        {
          name: 'meta.errors',
          title: 'Validation',
          cellClassFunc: (parcelElement: ClientParcelElement) => {
            const errors = parcelElement.meta.errors || [];
            return {
              'error-text': errors.length > 0
            };
          },
          valueAccessor: (parcelElement: ClientParcelElement) => {
            const errors = parcelElement.meta.errors || [];
            return errors.join(', ');
          }
        }
      ]
    };
  }
}
