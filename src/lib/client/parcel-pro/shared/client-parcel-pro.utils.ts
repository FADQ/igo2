import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { LanguageService } from '@igo2/core';
import {
  FeatureDataSource,
  VectorLayer
} from '@igo2/geo';

import { createOlTextStyle } from '../../../edition/shared/edition.utils';
import { Client } from '../../shared/client.interfaces';
import { ClientParcelPro } from './client-parcel-pro.interfaces';

export function createParcelProLayer(client: Client): VectorLayer {
  // TODO: i18n
  const parcelProDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: `${client.info.numero} - Parcelles`,
    zIndex: 102,
    source: parcelProDataSource,
    removable: false,
    browsable: false
  });
}

export function createParcelProLayerStyle(
): (olFeature: OlFeature, resolution: number) => olstyle.Style {
  var color = [200, 100, 100];
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

  return (function(olFeature: OlFeature, resolution: number) {
    const olText = olStyle.getText();
    olText.setText(getParcelProFeatureText(olFeature, resolution));
    return olStyle;
  });
}

function getParcelProFeatureText(olFeature: OlFeature, resolution: number): string {
  const maxResolution = 14;
  if (resolution > maxResolution) {
    return '';
  }

  const parts = [
    olFeature.get('noParcelleAgricole')
  ];
  const text = parts
    .filter((part) => part && part !== '')
    .join(' - ');

  return text;
}

export function generateParcelProOperationTitle(
  parcelPro: ClientParcelPro,
  languageService: LanguageService
): string {
  const terms = [
    parcelPro.properties.noParcelleAgricole
  ];
  return terms.filter((term: string) => term !== undefined).join(' - ');
}
