import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';

import { LanguageService } from '@igo2/core';
import {
  measureOlGeometryArea,
  FeatureDataSource,
  VectorLayer
} from '@igo2/geo';

import { createOlTextStyle } from '../../../edition/shared/edition.utils';
import { TransactionData } from '../../../utils/transaction';
import { Client } from '../../shared/client.interfaces';
import {
  ClientSchemaElement,
  ClientSchemaElementType,
  ClientSchemaElementTypes,
  ClientSchemaElementSaveData
} from './client-schema-element.interfaces';

export function computeSchemaElementArea(element: ClientSchemaElement): number {
  if (element.geometry.type !== 'Polygon') { return; }

  const measureProjection = 'EPSG:32198';
  const olGeometry = new OlGeoJSON().readGeometry(element.geometry, {
    dataProjection: element.projection,
    featureProjection: measureProjection
  });
  return measureOlGeometryArea(olGeometry, measureProjection);
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
  //TODO: i18n
  const schemaElementDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: `${client.info.numero} - Éléments du schémas`,
    zIndex: 102,
    source: schemaElementDataSource,
    removable: false,
    browsable: false
  });
}

export function createSchemaElementLayerStyle(
  types: ClientSchemaElementTypes
): (olFeature: OlFeature, resolution: number) => olstyle.Style {
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

  return (function(olFeature: OlFeature, resolution: number) {
    const geometryType = olFeature.getGeometry().getType();
    const elementType = olFeature.get('typeElement');
    const type = (types[geometryType] || []).find((_type: ClientSchemaElementType) => {
      return _type.value === elementType;
    });

    const style = styles[geometryType];
    if (geometryType === 'Point') {
      style.setImage(createSchemaPointShape(type));
      updateSchemaPointText(type, style.getText());
    } else {
      const color = type ? type.color : getSchemaElementDefaultColor();
      style.getFill().setColor(color.concat([0.30]));
      style.getStroke().setColor(color);
    }
    style.getText().setText(getSchemaElementFeatureText(olFeature, resolution));

    return style;
  });
}

function getSchemaElementFeatureText(olFeature: OlFeature, resolution: number): string {
  const maxResolution = 14;
  if (resolution > maxResolution) {
    return '';
  }
  return olFeature.get('etiquette');
}

function createSchemaPointShape(type: ClientSchemaElementType): olstyle.Circle | olstyle.RegularShape  {
  const typeCode = type ? type.value : undefined;
  const color = type ? type.color : getSchemaElementDefaultColor();
  const factories = {
    'CAG': createCAGShape,
    'CRI': createCRIShape,
    'SIL': createSILShape
  };
  const factory = factories[typeCode] || createDefaultPointShape;
  return factory(color);
}

function updateSchemaPointText(type: ClientSchemaElementType, olText: olstyle.Text)  {
  const typeCode = type ? type.value : undefined;
  if (['CAG', 'CRI', 'SIL'].indexOf(typeCode) < 0) {
    olText.setTextAlign('left');
    olText.setOffsetX(8);
    olText.setOffsetY(-8);
  }
}

function createDefaultPointShape(color: [number, number, number]): olstyle.Circle  {
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

function getSchemaElementDefaultColor() {
  return [128, 21, 21];
}

export function transactionDataToSaveSchemaElementData(
  data: TransactionData<ClientSchemaElement>
): ClientSchemaElementSaveData {
  return {
    lstElementsAjoutes: data.inserts,
    lstElementsModifies: data.updates,
    lstIdElementsSupprimes: data.deletes
  };
}
