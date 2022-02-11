import * as olstyle from 'ol/style';

import { IgoMap, Layer, WMSDataSource, WMTSDataSource } from '@igo2/geo';

export function padClientNum(clientNum: string | number) {
  return ('' + clientNum).padStart(7, '0');
}

export function createClientDefaultSelectionStyle(): olstyle.Style {
  const style = new olstyle.Style({
    stroke: new olstyle.Stroke({
      color: [0, 153, 255, 1],
      width: 2
    }),
    fill:  new olstyle.Fill({
      color: [0, 153, 255, 0]
    }),
    image: new olstyle.Circle({
      radius: 6,
      fill: new olstyle.Fill({
        color: [0, 153, 255, 0.15]
      }),
      stroke: new olstyle.Stroke({
        color: [0, 153, 255, 1],
        width: 2
      })
    })
  });

  return style;
}

export function getAnneeImageFromMap(map: IgoMap): number | undefined {
  const imageLayerNames = map.layers.reduce((acc: string[], layer: Layer) => {
    const dataSource = layer.dataSource;
    if ((
      !(dataSource instanceof WMTSDataSource) &&
      !(dataSource instanceof WMSDataSource)
    ) || !layer.visible) {
      return acc;
    }

    let layerName;
    if (dataSource instanceof WMTSDataSource) {
      layerName = dataSource.options.layer;
    } else if (dataSource instanceof WMSDataSource) {
      layerName = dataSource.options.params.LAYERS;
    }

    if (
      layerName.startsWith('Mosaiques-orthophotos_') ||
      layerName.startsWith('orthos') ||
      layerName.length === 4
    ) {
      acc.push(layerName);
    }

    return acc;
  }, []);

  const anneeRegex = new RegExp(/([1-9][\d]{3})/);
  const anneeImages = imageLayerNames.reduce((acc: number[], layerName: string) => {
    const matches = layerName.match(anneeRegex);
    if (matches) {
      acc.push(parseInt(matches[0], 10));
    }
    return acc;
  }, []);

  return anneeImages.length === 1 ? anneeImages[0] : undefined;
}

export function validateClientNum(clientNum?: string) {
  const clientNumMinLength = 3;
  const clientNumMaxLength = 7;

  if (!clientNum) {
    return false;
  }

  // Validate clientNum length
  const length = clientNum.length;
  if (length < clientNumMinLength || length > clientNumMaxLength) {
    return false;
  }

  // Validate that it contains digits only
  return /^\d+$/.test(clientNum);
}
