import { Injectable} from '@angular/core';

import { EntityTableTemplate } from '@igo2/common';
import { formatMeasure } from '@igo2/geo';

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
        // {
        //   name: 'properties.id',
        //   title: 'ID'
        // },
        {
          name: 'properties.noParcelleAgricole',
          title: 'Numéro de parcelle'
        },
        /*
        {
          name: 'properties.descriptionTypeElement',
          title: 'Type d\'élément'
        },
        {
          name: 'properties.etiquette',
          title: 'Étiquette'
        },
        {
          name: 'properties.description',
          title: 'Description'
        },
        {
          name: 'properties.superficie',
          title: 'Superficie(m²)',
          valueAccessor: (parcelElement: ClientParcelElement) => {
            const area = parcelElement.properties.superficie;
            return area ? formatMeasure(area, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.anneeImage',
          title: 'Année d\'image'
        },
        */
        {
          name: 'properties.timbreMaj',
          title: 'Date de mise à jour',
          valueAccessor: (parcelElement: ClientParcelElement) => {
            const value = parcelElement.properties.timbreMaj;
            if (!value) { return ''; }
            return formatDate(value);
          }
        },
        {
          name: 'properties.usagerMaj',
          title: 'Usager mise à jour'
        }
      ]
    };
  }
}
