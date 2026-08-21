import { BehaviorSubject, Observable, of} from 'rxjs';
import { switchMap, map as rxMap } from 'rxjs/operators';

import * as olstyle from 'ol/style';
import OlPolygon from 'ol/geom/Polygon';
import OlSimpleGeometry from 'ol/geom/SimpleGeometry';
import OlFeature, { FeatureLike } from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';

import { LanguageService } from '@igo2/core/language';
import {
  IgoMap,
  measureOlGeometryArea,
  FeatureDataSource,
  VectorLayer
} from '@igo2/geo';

import {
  Form,
  FormField,
  FormFieldSelectInputs,
  FormFieldSelectChoice,
  getAllFormFields
} from '@igo2/common/form';

import { createOlTextStyle } from '../../../edition/shared/edition.utils';
import { Client } from '../../shared/client.interfaces';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElementService } from '../shared/client-schema-element.service';
import {
  ClientSchemaElement,
  ClientSchemaElementType,
  ClientSchemaElementTypes,
  ClientSchemaElementSaveData,
  ClientSchemaElementGeometryType
} from './client-schema-element.interfaces';
import { getAnneeImageFromMap } from '../../shared/client.utils';
import { StyleFunction } from 'ol/style/Style';

export function computeSchemaElementArea(element: ClientSchemaElement): number {
  if (element.geometry.type !== 'Polygon') { return; }

  const measureProjection = 'EPSG:32198';
  const olGeometry = new OlGeoJSON().readGeometry(element.geometry, {
    dataProjection: element.projection,
    featureProjection: measureProjection
  });
  return measureOlGeometryArea(olGeometry as OlPolygon, measureProjection);
}

export function getSchemaElementValidationMessage(
  element: ClientSchemaElement,
  languageService: LanguageService
): string {
  return undefined;
}

export function generateSchemaElementOperationTitle(
  element: ClientSchemaElement,
  languageService: LanguageService
): string {
  // TODO: i18n
  let geometryType;
  if (element.geometry.type === 'Point') {
    geometryType = 'Point';
  } else if (element.geometry.type === 'LineString') {
    geometryType = 'Ligne';
  } else if (element.geometry.type === 'Polygon') {
    geometryType = 'Surface';
  }

  const terms = [
    geometryType,
    element.properties.typeElement,
    element.properties.description || undefined
  ];
  return terms.filter((term: string) => term !== undefined).join(' - ');
}

export function createSchemaElementLayer(client: Client): VectorLayer {
  // TODO: i18n
  const schemaElementDataSource = new FeatureDataSource({
    queryable: true
  } as any);
  return new VectorLayer({
    title: `${client.info.numero} - Éléments du schéma`,
    zIndex: 102,
    source: schemaElementDataSource,
    removable: false,
    browsable: false
  });
}

function getOlTypes(olFeature: OlFeature<OlSimpleGeometry>): 'Point' | 'LineString' | 'Polygon' {
  const rawType = olFeature.getGeometry().getType();

  if (rawType.includes('Point')) return 'Point';
  if (rawType.includes('LineString')) return 'LineString';
  if (rawType.includes('Polygon')) return 'Polygon';

  throw new Error(`Unsupported geometry type: ${rawType}`);
}

export function createSchemaElementLayerStyle(
  types: ClientSchemaElementTypes
): StyleFunction {
  const styles = {
    'Point': new olstyle.Style({
      text: createOlTextStyle()
    }),
    'LineString': new olstyle.Style({
      fill: new olstyle.Fill(),
      stroke: new olstyle.Stroke({
        width: 2
      }),
      text: createOlTextStyle()
    }),
    'Polygon': new olstyle.Style({
      fill: new olstyle.Fill(),
      stroke: new olstyle.Stroke({
        width: 2
      }),
      text: createOlTextStyle()
    }),
  };

  return function (feature: FeatureLike, resolution: number): olstyle.Style {
    const olFeature = feature as OlFeature<OlSimpleGeometry>;

    const geometryType = getOlTypes(olFeature);
    const elementType = olFeature.get('typeElement');

    const type = (types[geometryType] || []).find(
      (_type: ClientSchemaElementType) => _type.value === elementType
    );

    const style = styles[geometryType];

    if (geometryType === 'Point') {
      style.setImage(createSchemaPointShape(type));
      updateSchemaPointText(type, style.getText());
    } else {
      const color = type ? type.color : getSchemaElementDefaultColor();
      style.getFill().setColor(color.concat([0.3]));
      style.getStroke().setColor(color);
    }

    style.getText().setText(getSchemaElementFeatureText(olFeature, resolution));

    return style;
  };
}

function getSchemaElementFeatureText(olFeature: OlFeature<OlSimpleGeometry>, resolution: number): string {
  const maxResolution = 14;
  if (resolution > maxResolution) {
    return '';
  }
  return olFeature.get('etiquette');
}

function createSchemaPointShape(type: ClientSchemaElementType): olstyle.Circle | olstyle.RegularShape {
  type SchemaPointTypeCode = 'CAG' | 'CRI' | 'SIL';
  const typeCode = type ? type.value : undefined;
  const color = type ? type.color : getSchemaElementDefaultColor();
  const factories: Record<SchemaPointTypeCode, (color: [number, number, number]) => olstyle.RegularShape> = {
    CAG: createCAGShape,
    CRI: createCRIShape,
    SIL: createSILShape
  };
  const factory = typeCode && typeCode in factories
    ? factories[typeCode as SchemaPointTypeCode]
    : createDefaultPointShape;

  return factory(color);
}

function updateSchemaPointText(type: ClientSchemaElementType, olText: olstyle.Text) {
  const typeCode = type ? type.value : undefined;
  if (['CAG', 'CRI', 'SIL'].indexOf(typeCode) < 0) {
    olText.setTextAlign('left');
    olText.setOffsetX(8);
    olText.setOffsetY(-8);
  }
}

function createDefaultPointShape(color: [number, number, number]): olstyle.Circle {
  return new olstyle.Circle({
    fill: new olstyle.Fill({
      color: color.concat([1])
    }),
    radius: 6,
    stroke: new olstyle.Stroke({
      width: 1,
      color: color
    })
  });
}

function createCAGShape(color: [number, number, number]): olstyle.RegularShape {
  return new olstyle.RegularShape({
    stroke: new olstyle.Stroke({
      width: 3,
      color: color
    }),
    points: 4,
    radius: 10,
    angle: Math.PI / 4
  });
}

function createCRIShape(color: [number, number, number]): olstyle.RegularShape {
  return new olstyle.RegularShape({
    stroke: new olstyle.Stroke({
      width: 3,
      color: color
    }),
    points: 3,
    radius: 10,
    angle: 0
  });
}

function createSILShape(color: [number, number, number]): olstyle.RegularShape {
  return new olstyle.Circle({
    radius: 10,
    stroke: new olstyle.Stroke({
      width: 3,
      color: color
    })
  });
}

function getSchemaElementDefaultColor(): [number, number, number] {
  return [128, 21, 21];
}

// Migration 17: TransactionData n'est plus disponible. Remplacé par data: any afin de compiler.
export function transactionDataToSaveSchemaElementData(
  data: any
): ClientSchemaElementSaveData {
  return {
    lstElementsAjoutes: data.inserts,
    lstElementsModifies: data.updates,
    lstIdElementsSupprimes: data.deletes
  };
}

export function updateElementTypeChoices(geometryType: ClientSchemaElementGeometryType,
  clientSchemaElementService: ClientSchemaElementService,
   schema: ClientSchema, elementTypeField: FormField<FormFieldSelectInputs>) {
  clientSchemaElementService
    .getSchemaElementTypes(schema.type)
    .subscribe((schemaElementTypes: ClientSchemaElementTypes) => {
      const choices$ = elementTypeField.inputs.choices as BehaviorSubject<FormFieldSelectChoice[]>;
      choices$.next(schemaElementTypes[geometryType]);
    });
}


/**
 * Gets the field to contain the year of the image
 * @param form$ Form to display the schema element informations
 * @returns The field to contain the year of the image used to do the schema element
 */
export function getAnneeImageField(form$: BehaviorSubject<Form>): FormField {
  const fields = getAllFormFields(form$.value);
  return fields.find((field: FormField) => {
    return field.name === 'properties.anneeImage';
  });
}


/**
 * Find the image year upon wich a schema element is done
 * @param schemaElement The schema element to process
 * @param anneeImageField The field to contain the year of the image used to do the schema element
 * @param clientSchemaElementService Access to all the services related to a client element schema
 */
export function processAnneeImageField(
  schemaElement: ClientSchemaElement,
  clientSchemaElementService: ClientSchemaElementService,
  igoMap: IgoMap // ✅ renommé pour éviter conflit
): Observable<ClientSchemaElement> {

  if (schemaElement.properties?.anneeImage) {
    return of(schemaElement);
  }

  const imageYear = getAnneeImageFromMap(igoMap);

  // ✅ CAS 1 : année trouvée directement
  if (imageYear !== undefined && imageYear !== null) {
    schemaElement.properties.anneeImage = imageYear;
    return of(schemaElement);
  }

  // ✅ CAS 2 : fallback via service
  return of(schemaElement).pipe(

    switchMap((element) => {

      if (!element.geometry) {
        return of(element);
      }

      // ✅ cast propre vers GeoJSON (ce que ton service attend)
      const geometry = element.geometry as any;

      return clientSchemaElementService
        .getMostRecentImageYear(geometry)
        .pipe(
          rxMap((response: any) => {

            const year = response?.data;

            if (year !== undefined && year !== null) {
              element.properties.anneeImage = year;
            }

            return element;
          })
        );
    })
  );
}
