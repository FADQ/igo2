import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { LanguageService } from '@igo2/core';
import { FeatureDataSource, VectorLayer } from '@igo2/geo';
// import { uuid } from '@igo2/utils';

import { Client } from '../../shared/client.interfaces';
// import { ClientParcel } from '../../parcel/shared/client-parcel.interfaces';
import { ClientParcelElement } from './client-parcel-element.interfaces';

export function createParcelElementLayer(client: Client): VectorLayer {
  const parcelElementDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: `${client.info.numero} - Parcelles du schéma`,
    zIndex: 102,
    source: parcelElementDataSource,
    style: createParcelElementLayerStyle(client),
    removable: false,
    browsable: false
  });
}

export function createParcelElementLayerStyle(client: Client): (olFeature: OlFeature) => olstyle.Style {
  const olStyle = new olstyle.Style({
    fill: new olstyle.Fill(),
    stroke: new olstyle.Stroke({
      width: 2
    }),
    text: createParcelElementLayerTextStyle()
  });

  return (function(olFeature: OlFeature) {
    const color = getParcelElementDefaultColor();
    olStyle.getFill().setColor(color.concat([0.30]));
    olStyle.getStroke().setColor(color);
    olStyle.getText().setText(olFeature.get('etiquette'));
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

function getParcelElementDefaultColor() {
  return [128, 21, 21];
}
/*
export function parcelToParcelElement(parcel: ClientParcel): ClientParcelElement {
  const meta = Object.assign({}, parcel.meta, {id: uuid()});
  return {
    type: parcel.type,
    projection: parcel.projection,
    properties: Object.assign({
      idElementGeometrique: undefined,
      typeElement: 'PAC',  // TODO
      descriptionTypeElement: 'Parcelle agricole cultivable',  // TODO
      etiquette: undefined,
      description: undefined,
      anneeImage: undefined,
      timbreMaj: undefined,
      usagerMaj: undefined,
      superficie: undefined
    }, parcel.properties),
    geometry: parcel.geometry,
    meta
  };
}
*/

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
