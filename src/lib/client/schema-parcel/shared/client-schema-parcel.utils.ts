import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { FeatureDataSource, VectorLayer } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';

export function createSchemaParcelLayer(client: Client): VectorLayer {
  const schemaElementDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: `${client.info.numero} - Parcelles du schéma`,
    zIndex: 102,
    source: schemaElementDataSource,
    style: createSchemaParcelLayerStyle(client),
    removable: false,
    browsable: false
  });
}

export function createSchemaParcelLayerStyle(client: Client): (olFeature: OlFeature) => olstyle.Style {
  const olStyle = new olstyle.Style({
    fill: new olstyle.Fill(),
    stroke: new olstyle.Stroke({
      width: 2
    }),
    text: createSchemaParcelLayerTextStyle()
  });

  return (function(olFeature: OlFeature) {
    const color = getSchemaParcelDefaultColor();
    olStyle.getFill().setColor(color.concat([0.30]));
    olStyle.getStroke().setColor(color);
    olStyle.getText().setText(olFeature.get('etiquette'));
    return olStyle;
  });
}

function createSchemaParcelLayerTextStyle(): olstyle.Text {
  return new olstyle.Text({
    font: '16px Calibri,sans-serif',
    fill: new olstyle.Fill({ color: '#000' }),
    stroke: new olstyle.Stroke({ color: '#fff', width: 3 }),
    overflow: true
  });
}

function getSchemaParcelDefaultColor() {
  return [128, 21, 21];
}
