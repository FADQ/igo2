import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { FeatureDataSource, VectorLayer } from '@igo2/geo';

export function createSchemaElementSurfaceLayer(): VectorLayer {
  const schemaElementSurfaceDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: 'Surfaces du schéma',
    zIndex: 101,
    source: schemaElementSurfaceDataSource,
    style: createSchemaElementSurfaceLayerStyle()
  });
}

export function createSchemaElementSurfaceLayerStyle(): (feature: OlFeature) => olstyle.Style {
  const style = new olstyle.Style({
    stroke: new olstyle.Stroke({
      width: 2
    }),
    fill:  new olstyle.Fill(),
    text: createSchemaElementSurfaceLayerTextStyle()
  });

  return (function(feature: OlFeature) {
    const color = getSchemaElementSurfaceFeatureColor(feature);
    style.getFill().setColor(color.concat([0.15]));
    style.getStroke().setColor(color);
    style.getText().setText(feature.get('etiquette'));
    return style;
  });
}

function createSchemaElementSurfaceLayerTextStyle(): olstyle.Text {
  return new olstyle.Text({
    font: '16px Calibri,sans-serif',
    fill: new olstyle.Fill({ color: '#000' }),
    stroke: new olstyle.Stroke({ color: '#fff', width: 3 }),
    overflow: true
  });
}

function getSchemaElementSurfaceFeatureColor(feature: OlFeature) {
  return [0, 218, 250];
}

