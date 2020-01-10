import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';
import OlMultiPoint from 'ol/geom/MultiPoint';

import { getEntityTitle } from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { Feature } from '@igo2/geo';
import { uuid } from '@igo2/utils';

export function getOperationTitle(feature: Feature, languageService: LanguageService) {
  return getEntityTitle(feature) || uuid();
}

export function createOlEditionStyle(): olstyle.Style[] {
  const color = [0, 218, 250];  // Teal;
  return [
    new olstyle.Style({
      fill: new olstyle.Fill({
        color: color.concat([0.30])
      }),
      stroke: new olstyle.Stroke({
        color: color,
        width: 2
      }),
      image: new olstyle.Circle({
        radius: 5,
        stroke: new olstyle.Stroke({
          color: color,
        }),
        fill: new olstyle.Fill({
          color: color.concat([0.30])
        })
      })
    }),
    new olstyle.Style({
      image: new olstyle.Circle({
        radius: 5,
        stroke: new olstyle.Stroke({
          color: color,
        }),
        fill: new olstyle.Fill({
          color: color.concat([0.30])
        })
      }),
      geometry: function(olFeature: OlFeature) {
        const olGeometry = olFeature.getGeometry();
        const coordinates = olGeometry.getCoordinates().reduce((r, c) => {
          return r.concat(c);
        }, []);
        return new OlMultiPoint(coordinates);
      }
    })
  ];
}

export function createOlEditionTranslateStyle(): olstyle.Style {
  return createOlEditionStyle()[0];
}

export function createOlTextStyle(): olstyle.Text {
  return new olstyle.Text({
    font: '12px Calibri,sans-serif',
    fill: new olstyle.Fill({
      color: '#000'
    }),
    stroke: new olstyle.Stroke({
      color: '#fff',
      width: 3
    }),
    overflow: true
  });
}
