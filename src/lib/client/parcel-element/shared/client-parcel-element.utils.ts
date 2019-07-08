import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';

import { LanguageService } from '@igo2/core';
import {
  FeatureDataSource,
  VectorLayer,
  measureOlGeometryArea
} from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElement } from './client-parcel-element.interfaces';

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
    title: `${client.info.numero} - Parcelles du schéma`,
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

  return (function(olFeature: OlFeature, resolution: number) {
    olStyle.getText().setText(getParcelElementFeatureText(olFeature, resolution));
    return olStyle;
  });
}

function createParcelElementLayerTextStyle(): olstyle.Text {
  return new olstyle.Text({
    font: '12px Calibri,sans-serif',
    fill: new olstyle.Fill({ color: '#000' }),
    stroke: new olstyle.Stroke({ color: '#fff', width: 3 }),
    overflow: true
  });
}

function getParcelElementFeatureText(olFeature: OlFeature, resolution: number): string {
  const maxResolution = 14;
  if (resolution > maxResolution) {
    return '';
  }
  return olFeature.get('noParcelleAgricole');
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
