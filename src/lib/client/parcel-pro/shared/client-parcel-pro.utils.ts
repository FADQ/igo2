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
  ClientParcelProGroup
} from './client-parcel-pro.interfaces';
import { ClientParcelProColors } from './client-parcel-pro.enums';

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

    const color = getParcelProProductionColor( olFeature.get('production'));
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

function getParcelProProductionColor(production: string): [number, number, number] {
  const color = ClientParcelProColors[production];
  return color || [200, 100, 100];
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

export function computeParcelProGroups(parcelPros: ClientParcelPro[]): ClientParcelProGroup[] {
  const groupsByProduction: {[key: string]: ClientParcelProGroup} = {};
  for (let i = 0; i < parcelPros.length; i++) {
    const parcelPro = parcelPros[i];
    const production = parcelPro.properties['production'] || 'unknown';
    let group = groupsByProduction[production];
    if (group === undefined) {
      group = {
        production,
        color: getParcelProProductionColor(production),
        parcels: []
      };
      groupsByProduction[production] = group;
    }

    group.parcels.push(parcelPro);
  }

  return Object.keys(groupsByProduction)
    .sort()
    .map((key: string) => groupsByProduction[key]);
}
