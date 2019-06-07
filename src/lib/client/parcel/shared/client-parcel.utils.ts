import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { FeatureDataSource, VectorLayer } from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import { Client } from '../../shared/client.interfaces';
import { hexToRGB } from 'src/lib/utils/color';
import { ClientParcelDiagram, ClientParcel, ClientParcelListResponseItem } from './client-parcel.interfaces';

export function getDiagramsFromParcels(parcels: ClientParcel[]): ClientParcelDiagram[] {
  const diagramIds = new Set(parcels.map((parcel: ClientParcel) => {
    return parcel.properties.noDiagramme;
  }));

  return Array.from(diagramIds).map((id: number) => {
    return {id};
  });
}

export function getParcelRelation(listItem: ClientParcelListResponseItem, noClientRech: string) {
  const noClientDet = listItem.properties.noClientDetenteur || noClientRech;
  const noClientExp = listItem.properties.noClientExploitant || noClientDet;

  // Relation is a number used to order the parcels on the map and to define their color
  let relation;
  if (noClientRech === noClientExp) {
    relation = 1;  // Orange;
  } else if (!noClientDet || noClientDet !== noClientExp) {
    relation = 2;  // Vert
  } else {
    relation = 3;  // Turquoise
  }

  return relation;
}

function getParcelFeatureColor(olFeature: OlFeature) {
  const colors = {
    1: [255, 139, 0],
    2: [35, 140, 0],
    3: [0, 218, 250]
  };
  return colors[ olFeature.get('relation')];
}

export function generateParcelColor(index: number): [number, number, number] {
  const colors = [
    '8e24aa',
    'ffeb3b',
    '00bcd4',
    'd81b60',
    'ff8f00'
  ];

  let color;
  if (index >= colors.length) {
    color = '' + Math.floor(Math.random() * 16777215).toString(16);
  } else {
    color = colors[index];
  }
  return hexToRGB(color);
}

export function createParcelLayer(client: Client): VectorLayer {
  const parcelDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: `${client.info.numero} - Parcelles`,
    zIndex: 100,
    source: parcelDataSource,
    removable: false,
    browsable: false
  });
}

export function createPerClientParcelLayerStyle(
  color: [number, number, number]
): (olFeature: OlFeature) => olstyle.Style {

  const style = new olstyle.Style({
    stroke: new olstyle.Stroke({
      width: 2,
      color
    }),
    fill:  new olstyle.Fill({
      color: [...color].concat([0.15])
    }),
    text: createParcelLayerTextStyle()
  });

  return (function(feature: OlFeature) {
    style.getText().setText(feature.get('_mapTitle'));
    return style;
  });
}

export function createParcelLayerStyle(): (olFeature: OlFeature) => olstyle.Style {
  const style = new olstyle.Style({
    stroke: new olstyle.Stroke({
      width: 2
    }),
    fill:  new olstyle.Fill(),
    text: createParcelLayerTextStyle()
  });

  return (function(feature: OlFeature) {
    const color = getParcelFeatureColor(feature);
    style.getFill().setColor(color.concat([0.15]));
    style.getStroke().setColor(color);
    style.getText().setText(feature.get('_mapTitle'));
    return style;
  });
}

function createParcelLayerTextStyle(): olstyle.Text {
  return new olstyle.Text({
    font: '16px Calibri,sans-serif',
    fill: new olstyle.Fill({ color: '#000' }),
    stroke: new olstyle.Stroke({ color: '#fff', width: 3 }),
    overflow: true
  });
}

export function sortParcelsByRelation(p1: ClientParcel, p2: ClientParcel) {
  return ObjectUtils.naturalCompare(
    p1.properties.relation,
    p2.properties.relation,
    'desc'
  );
}
