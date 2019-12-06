import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';

import { LanguageService } from '@igo2/core';
import {
  FeatureDataSource,
  VectorLayer,
  measureOlGeometryArea
} from '@igo2/geo';

import { TransactionData } from '../../../utils/transaction';
import { ClientParcelDiagram } from '../../parcel/shared/client-parcel.interfaces';
import { Client } from '../../shared/client.interfaces';
import {
  ClientParcelElement,
  ClientParcelElementMessage,
  ClientParcelElementSaveData
} from './client-parcel-element.interfaces';

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
  return measureOlGeometryArea(olGeometry, measureProjection);
}

export function createParcelElementLayer(client: Client): VectorLayer {
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
): (olFeature: OlFeature, resolution: number) => olstyle.Style {
  const olStyle = new olstyle.Style({
    fill: new olstyle.Fill({
      color: color.concat([0.30])
    }),
    stroke: new olstyle.Stroke({
      color: color,
      width: 2
    }),
    text: createParcelElementLayerTextStyle()
  });

  const olNoOwnerStyle = new olstyle.Style({
    fill: new olstyle.Fill({
      color: [30, 30, 30, 0.30]
    }),
    stroke: new olstyle.Stroke({
      color: [30, 30, 30],
      width: 2
    }),
  });

  return (function(olFeature: OlFeature, resolution: number) {
    if (olFeature.get('noOwner') === true) {
      return olNoOwnerStyle;
    }

    const olText = olStyle.getText();
    const olTextFill = olText.getFill();
    olText.setText(getParcelElementFeatureText(olFeature, resolution));

    const messages = olFeature.get('messages') || [];
    const hasError = messages.some((message: ClientParcelElementMessage) => message.severite === 'S');
    if (hasError) {
      olTextFill.setColor('#f44336');
    } else {
      olTextFill.setColor('#000');
    }

    return olStyle;
  });
}

function createParcelElementLayerTextStyle(): olstyle.Text {
  return new olstyle.Text({
    font: '12px Calibri,sans-serif',
    fill: new olstyle.Fill(),
    stroke: new olstyle.Stroke({
      color: '#fff',
      width: 3
    }),
    overflow: true
  });
}

function getParcelElementFeatureText(olFeature: OlFeature, resolution: number): string {
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
  const messagesObject = messages.reduce((acc: object, message: ClientParcelElementMessage) => {
    acc[message.id] = message;
    return acc;
  }, {} as {[key: string]: ClientParcelElementMessage});
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

export function transactionDataToSaveParcelElementData(
  data: TransactionData<ClientParcelElement>
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
