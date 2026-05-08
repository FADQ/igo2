import * as olstyle from 'ol/style';
import OlFeature, { FeatureLike } from 'ol/Feature';
import OlPolygon from 'ol/geom/Polygon';
import OlGeoJSON from 'ol/format/GeoJSON';
import turfUnion from '@turf/union';
import { Feature, Polygon } from '@turf/helpers';

import { getEntityRevision } from '@igo2/common/entity';
import { LanguageService } from '@igo2/core/language';
import { Context } from '@igo2/context';
import {
  FeatureDataSource,
  VectorLayer,
  measureOlGeometryArea
} from '@igo2/geo';
import { uuid } from '@igo2/utils';

import { createOlTextStyle } from '../../../edition/shared/edition.utils';
// import { TransactionData } from '../../../utils/transaction';
import { ClientParcelDiagram } from '../../parcel/shared/client-parcel.interfaces';
import { Client } from '../../shared/client.interfaces';
import {
  ClientParcelElement,
  ClientParcelElementMessage,
  ClientParcelElementSaveData
} from './client-parcel-element.interfaces';
import { StyleFunction } from 'ol/style/Style';

export function parcelElementsEnabledInContext(context: Context) {
  return context.uri === 'mesurage' || (context as any).mesurage === true;
}

export function getDiagramsFromParcelElements(parcelElements: ClientParcelElement[]): ClientParcelDiagram[] {
  const diagramIds = new Set(parcelElements.map((parcelElement: ClientParcelElement) => {
    return parcelElement.properties.noDiagramme;
  }));

  return Array.from(diagramIds).map((id: number) => {
    return {id};
  });
}

export function computeParcelElementArea(parcelElement: ClientParcelElement): number {
  const measureProjection = 'EPSG:32198';
  const olGeometry = new OlGeoJSON().readGeometry(parcelElement.geometry, {
    dataProjection: parcelElement.projection,
    featureProjection: measureProjection
  });
  return measureOlGeometryArea(olGeometry as OlPolygon, measureProjection);
}

export function createParcelElementLayer(client: Client): VectorLayer {
  // TODO: i18n
  const parcelElementDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: `${client.info.numero} - Parcelles en édition`,
    zIndex: 102,
    source: parcelElementDataSource,
    removable: false,
    browsable: false
  });
}

export function createParcelElementLayerStyle(
  color: [number, number, number]
): StyleFunction {
  const olStyle = new olstyle.Style({
    fill: new olstyle.Fill({
      color: color.concat([0])
    }),
    stroke: new olstyle.Stroke({
      color: color,
      width: 2
    }),
    text: createOlTextStyle()
  });

  const olNoOwnerStyle = new olstyle.Style({
    fill: new olstyle.Fill({
      color: [240, 240, 130, 1]
    }),
    stroke: new olstyle.Stroke({
      color: [30, 30, 30],
      width: 3
    }),
    text: createOlTextStyle()
  });

  return function (feature: FeatureLike, resolution: number): olstyle.Style {
    const olFeature = feature as OlFeature<OlPolygon>;

    let olText;

    if (olFeature.get('noOwner') === true) {
      olText = olNoOwnerStyle.getText();
      olText.setText(olFeature.get('annee').toString());
      return olNoOwnerStyle;
    }

    olText = olStyle.getText();
    const olTextFill = olText.getFill();
    olText.setText(getParcelElementFeatureText(olFeature, resolution));

    const messages = olFeature.get('messages') || [];
    const hasError = messages.some(
      (message: ClientParcelElementMessage) => message.severite === 'S'
    );

    olTextFill.setColor(hasError ? '#f44336' : '#000');

    return olStyle;
  };
}

function getParcelElementFeatureText(olFeature: OlFeature<OlPolygon>, resolution: number): string {
  const maxResolution = 14;
  if (resolution > maxResolution) {
    return '';
  }

  const parts = [
    olFeature.get('noParcelleAgricole'),
    olFeature.get('statutAugmentationSupCultivable')
  ];
  const text = parts
    .filter((part) => part && part !== '')
    .join(' - ');

  return text;
}

export function getParcelElementErrors(parcelElement: ClientParcelElement): ClientParcelElementMessage[] {
  const messages = getUniqueParcelElementMessages(parcelElement);
  return messages.filter((message: ClientParcelElementMessage) => message.severite === 'S');
}

export function getParcelElementWarnings(parcelElement: ClientParcelElement): ClientParcelElementMessage[] {
  const messages = getUniqueParcelElementMessages(parcelElement);
  return messages.filter((message: ClientParcelElementMessage) => message.severite === 'A');
}

function getUniqueParcelElementMessages(
  parcelElement: ClientParcelElement
): ClientParcelElementMessage[] {
  const messages = parcelElement.properties.messages;

  const messagesObject = Object.fromEntries(
    messages.map(m => [m.id, m])
  );

  return Object.values(messagesObject);
}

export function generateParcelElementOperationTitle(
  parcelElement: ClientParcelElement,
  languageService: LanguageService
): string {
  const terms = [
    parcelElement.properties.noParcelleAgricole
  ];
  return terms.filter((term: string) => term !== undefined).join(' - ');
}

// Migration 17: TransactionData n'est plus disponible. Remplacé par data: any afin de compiler.
export function transactionDataToSaveParcelElementData(
  data: any
): ClientParcelElementSaveData {
  return {
    lstParcellesAjoutes: data.inserts,
    lstParcellesModifies: data.updates,
    lstIdParcellesSupprimes: data.deletes
  };
}

export function getParcelElementValidationMessage(
  parcelElement: ClientParcelElement,
  languageService: LanguageService
): string {
  return undefined;
}

export function getParcelElementMergeBase(
  parcelElements: ClientParcelElement[]
): ClientParcelElement {
  const parcelElementsWithId = parcelElements
    .filter((parcelElement: ClientParcelElement) => {
      return parcelElement.properties.idParcelle !== undefined;
    });

  const candidates = parcelElementsWithId.length > 0 ? parcelElementsWithId : parcelElements;
  let maxArea = 0;
  let base;
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const area = computeParcelElementArea(candidate);
    if (area > maxArea) {
      maxArea = area;
      base = candidate;
    }
  }

  return base;
}

export function unionParcelElements(parcelElements: ClientParcelElement[]): [ClientParcelElement, ClientParcelElement] {
  const base = getParcelElementMergeBase(parcelElements);
  const properties = base.properties;
  let meta;
  if (base.properties.idParcelle) {
    meta = Object.assign({}, base.meta, {
      revision: getEntityRevision(base) + 1
    });
  } else {
    meta = {
      id: uuid()
    };
  }

  let union = parcelElements[0];
  for (let i = 1; i < parcelElements.length; i++) {
    union = turfUnion(
      union as Feature<Polygon>,
      parcelElements[i] as Feature<Polygon>
    );
  }
  Object.assign(union, {
    meta,
    projection: 'EPSG:4326',
    properties
  });

  return [union, base];
}
