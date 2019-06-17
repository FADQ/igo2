import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { LanguageService } from '@igo2/core';
import { FeatureDataSource, VectorLayer } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElement } from './client-parcel-element.interfaces';

export function createParcelElementLayer(client: Client): VectorLayer {
  const parcelElementDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: `${client.info.numero} - Parcelles du schéma`,
    zIndex: 102,
    source: parcelElementDataSource,
    removable: false,
    browsable: false
  });
}

export function createParcelElementLayerStyle(
  color: [number, number, number]
): (olFeature: OlFeature) => olstyle.Style {
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

  return (function(olFeature: OlFeature) {
    olStyle.getText().setText(olFeature.get('noParcelleAgricole'));
    return olStyle;
  });
}

function createParcelElementLayerTextStyle(): olstyle.Text {
  return new olstyle.Text({
    font: '16px Calibri,sans-serif',
    fill: new olstyle.Fill({ color: '#000' }),
    stroke: new olstyle.Stroke({ color: '#fff', width: 3 }),
    overflow: true
  });
}

export function getParcelElementValidationMessage(
  parcelElement: ClientParcelElement,
  languageService: LanguageService
): string {
  return undefined;
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
