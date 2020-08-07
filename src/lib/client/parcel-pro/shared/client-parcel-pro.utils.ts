import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { LanguageService } from '@igo2/core';
import {
  FeatureDataSource,
  VectorLayer
} from '@igo2/geo';

import { createOlTextStyle } from '../../../edition/shared/edition.utils';
import { Client } from '../../shared/client.interfaces';
import {
  ClientParcelPro,
  ClientParcelProProduction,
  ClientParcelProCategory
} from './client-parcel-pro.interfaces';
import {
  ClientParcelProCategories,
  ClientParcelProProductions
} from './client-parcel-pro.enums';

export function createParcelProLayer(client: Client): VectorLayer {
  // TODO: i18n
  const parcelProDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: `${client.info.numero} - Parcelles`,
    zIndex: 100,
    source: parcelProDataSource,
    removable: false,
    browsable: false
  });
}

export function createParcelProLayerStyle(
): (olFeature: OlFeature, resolution: number) => olstyle.Style {
  const olStyle = new olstyle.Style({
    fill: new olstyle.Fill({
    }),
    stroke: new olstyle.Stroke({
      width: 2
    }),
    text: createOlTextStyle()
  });

  return (function(olFeature: OlFeature, resolution: number) {
    const olText = olStyle.getText();
    olText.setText(getParcelProOlFeatureText(olFeature, resolution));

    const category = getProductionCategory(olFeature.get('production'));
    const color = category.color;
    olStyle.getFill().setColor(color.concat([0.15]));
    olStyle.getStroke().setColor(color);

    return olStyle;
  });
}

function getParcelProOlFeatureText(olFeature: OlFeature, resolution: number): string {
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

export function getProduction(code: string): ClientParcelProProduction {
  code = code ? code.toUpperCase() : 'INC';
  return ClientParcelProProductions[code];
}

export function getProductionCategory(code: string): ClientParcelProCategory {
  code = code ? code.toUpperCase() : 'INC';
  const categories = Object.values(ClientParcelProCategories);
  const category = categories.find((cat: ClientParcelProCategory) => {
    return cat.productions.includes(code);
  });
  return category || ClientParcelProCategories['INC'];
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
