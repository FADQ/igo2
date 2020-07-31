import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { FormFieldSelectChoice } from '@igo2/common';

import { FeatureDataSource, VectorLayer } from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import { createOlTextStyle } from '../../../edition/shared/edition.utils';
import { Client } from '../../shared/client.interfaces';
import { ClientRelationColors, ClientParcelDraineeChoices } from './client-parcel.enums';
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
  const estDet = listItem.properties.indEstDetenteur || undefined;
  const estExp = listItem.properties.indEstExploitant || undefined;

  // Relation is a number used to order the parcels on the map and to define their color
  let relation = 1;  // Orange
  if (estDet === 'N' && estExp === 'O') {
    relation = 3;  // Teal
  } else if (estDet === 'O' && estExp === 'N') {
    relation = 2;  // Green
  }

  return relation;
}

export function sortParcelsByRelation(p1: ClientParcel, p2: ClientParcel) {
  return ObjectUtils.naturalCompare(
    p1.properties.relation,
    p2.properties.relation,
    'desc'
  );
}

export function createParcelLayer(client: Client): VectorLayer {
  // TODO: i18n
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
): (olFeature: OlFeature, resolution: number) => olstyle.Style {

  const style = new olstyle.Style({
    stroke: new olstyle.Stroke({
      width: 2,
      color
    }),
    fill:  new olstyle.Fill({
      color: [...color].concat([0])
    }),
    text: createOlTextStyle()
  });

  return (function(olFeature: OlFeature, resolution: number) {
    style.getText().setText(getParcelFeatureText(olFeature, resolution));
    return style;
  });
}

export function createParcelLayerStyle(): (olFeature: OlFeature, resolution: number) => olstyle.Style {
  const style = new olstyle.Style({
    stroke: new olstyle.Stroke({
      width: 2
    }),
    fill:  new olstyle.Fill(),
    text: createOlTextStyle()
  });

  return (function(olFeature: OlFeature, resolution: number) {
    const color = getParcelFeatureColor(olFeature);
    style.getFill().setColor(color.concat([0]));
    style.getStroke().setColor(color);
    style.getText().setText(getParcelFeatureText(olFeature, resolution));
    return style;
  });
}

function getParcelFeatureText(olFeature: OlFeature, resolution: number): string {
  const maxResolution = 14;
  if (resolution > maxResolution) {
    return '';
  }
  return olFeature.get('noParcelleAgricole');
}

function getParcelFeatureColor(olFeature: OlFeature) {
  return ClientRelationColors['' + olFeature.get('relation')];
}

export function getParcelDraineeChoices(): FormFieldSelectChoice[] {
  return ClientParcelDraineeChoices;
}
