import { Injectable} from '@angular/core';

import { EntityTableTemplate } from '@igo2/common';
import { formatMeasure } from '@igo2/geo';

import { formatDate } from 'src/lib/utils/date';
import { ClientSchemaParcel } from './client-schema-parcel.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaParcelTableService {

  buildTable(): EntityTableTemplate {
    return {
      selection: true,
      selectionCheckbox: true,
      selectMany: true,
      sort: true,
      headerClassFunc: (() => {
        return {'text-centered': true};
      }),
      rowClassFunc: ((schemaParcel: ClientSchemaParcel) => {
        return {'text-centered': true};
      }),
      columns: [
        {
          name: 'properties.idElementGeometrique',
          title: 'ID élément'
        },
        {
          name: 'properties.noParcelleAgricole',
          title: 'Numéro de parcelle'
        },
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
          valueAccessor: (schemaParcel: ClientSchemaParcel) => {
            const area = schemaParcel.properties.superficie;
            return area ? formatMeasure(area, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.anneeImage',
          title: 'Année d\'image'
        },
        {
          name: 'properties.timbreMaj',
          title: 'Date de mise à jour',
          valueAccessor: (schemaParcel: ClientSchemaParcel) => {
            const value = schemaParcel.properties.timbreMaj;
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
