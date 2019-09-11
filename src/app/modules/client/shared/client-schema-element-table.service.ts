import { Injectable} from '@angular/core';

import { EntityTableTemplate, EntityTableColumnRenderer } from '@igo2/common';
import { formatMeasure, squareMetersToAcres, squareMetersToHectares } from '@igo2/geo';

import { formatDate } from 'src/lib/utils/date';
import { ClientSchemaElement } from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementTableService {

  static schemaElementTypes = {
    'Point': 'P',
    'LineString': 'L',
    'Polygon': 'S'
  };

  constructor() {}

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
      rowClassFunc: ((schemaElement: ClientSchemaElement) => {
        return {'text-centered': true};
      }),
      columns: [
        {
          name: 'geometry.type',
          title: 'Type',
          renderer: EntityTableColumnRenderer.HTML,
          valueAccessor: (schemaElement: ClientSchemaElement) => {
            return `<b>${ClientSchemaElementTableService.schemaElementTypes[schemaElement.geometry.type]}`;
          }
        },
        {
          name: 'properties.idElementGeometrique',
          title: 'ID élément'
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
          valueAccessor: (schemaElement: ClientSchemaElement) => {
            const area = schemaElement.properties.superficie;
            return area ? formatMeasure(area, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'superficieHectares',
          title: 'Superficie (ha)',
          valueAccessor: (schemaElement: ClientSchemaElement) => {
            const area = schemaElement.properties.superficie;
            return area ? formatMeasure(squareMetersToHectares(area), {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'superficieAcres',
          title: 'Superficie (acres)',
          valueAccessor: (schemaElement: ClientSchemaElement) => {
            const area = schemaElement.properties.superficie;
            return area ? formatMeasure(squareMetersToAcres(area), {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.anneeImage',
          title: 'Année d\'image'
        },
        {
          name: 'properties.timbreMaj',
          title: 'Date de mise à jour',
          valueAccessor: (schemaElement: ClientSchemaElement) => {
            const value = schemaElement.properties.timbreMaj;
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
