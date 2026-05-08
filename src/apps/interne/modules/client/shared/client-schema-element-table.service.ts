import { Injectable} from '@angular/core';

import OlGeoJSON from 'ol/format/GeoJSON';
import OlLineString from 'ol/geom/LineString';

import { EntityTableTemplate, EntityTableColumnRenderer } from '@igo2/common/entity';
import { formatMeasure, measureOlGeometryLength, squareMetersToAcres, squareMetersToHectares } from '@igo2/geo';

import { formatDate } from 'src/lib/utils/date';
import { ClientSchemaElement } from 'src/lib/client';
import { typedRowClass } from '@lib/compatibility/typedAccessor';

  type GeometryType =
    | 'Point'
    | 'MultiPoint'
    | 'LineString'
    | 'MultiLineString'
    | 'Polygon'
    | 'MultiPolygon'
    | 'GeometryCollection';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementTableService {

  static schemaElementTypes: Partial<Record<GeometryType, string>> = {
    Point: 'P',
    LineString: 'L',
    Polygon: 'S'
  };

  constructor() {}

  buildTable(): EntityTableTemplate {
    // TODO: i18n
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
      rowClassFunc: typedRowClass<ClientSchemaElement>(() => {
        return {'text-centered': true};
      }),
      columns: [
        {
          name: 'geometry.type',
          title: 'Type',
          renderer: EntityTableColumnRenderer.HTML,
          valueAccessor: (entity: Object) => {
            const schemaElement = entity as ClientSchemaElement;
            const geometryType = schemaElement.geometry.type;
            const value = ClientSchemaElementTableService.schemaElementTypes[geometryType];
            return `<b>${value}</b>`;
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
          title: 'Description ou commentaire'
        },
        {
          name: 'properties.superficie',
          title: 'Superficie (m²)',
          valueAccessor: (entity: Object) => {
            const schemaElement = entity as ClientSchemaElement;
            const area = schemaElement.properties.superficie;
            return area ? formatMeasure(area, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'superficieHectares',
          title: 'Superficie (ha)',
          valueAccessor: (entity: Object) => {
            const schemaElement = entity as ClientSchemaElement;
            const area = schemaElement.properties.superficie;
            return area ? formatMeasure(squareMetersToHectares(area), {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'superficieAcres',
          title: 'Superficie (acres)',
          valueAccessor: (entity: Object) => {
            const schemaElement = entity as ClientSchemaElement;
            const area = schemaElement.properties.superficie;
            return area ? formatMeasure(squareMetersToAcres(area), {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'superficieArpents',
          title: 'Superficie (arpents)',
          valueAccessor: (entity: Object) => {
            const schemaElement = entity as ClientSchemaElement;
            const area = Number(squareMetersToHectares(schemaElement.properties.superficie).toFixed(1));
            return area ? formatMeasure(area*2.924, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'longueur',
          title: 'Longueur - Périmètre (m)',
          valueAccessor: (entity: Object) => {
            const schemaElement = entity as ClientSchemaElement;
            let length = 0;
            const olGeometry = new OlGeoJSON().readGeometry(schemaElement.geometry, {
              dataProjection: schemaElement.projection,
              featureProjection: schemaElement.projection
            });
            length = measureOlGeometryLength(olGeometry as OlLineString, schemaElement.projection);
            return length ? formatMeasure(length, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.anneeImage',
          title: 'Année d\'image'
        },
        {
          name: 'properties.timbreMaj',
          title: 'Date de mise à jour',
          valueAccessor: (entity: Object) => {
            const schemaElement = entity as ClientSchemaElement;
            const value = schemaElement.properties.timbreMaj;
            if (!value) { return ''; }
            return formatDate(value);
          }
        },
        {
          name: 'properties.usagerMaj',
          title: 'Usager mise à jour',
          valueAccessor: (entity: Object) => {
            const schemaElement = entity as ClientSchemaElement;
            const value = schemaElement.properties.idenUsagerMaj;
            if (value) { return value; }
            return schemaElement.properties.usagerMaj;
          }
        }
      ]
    };
  }
}
