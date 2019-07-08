import * as olstyle from 'ol/style';

import { IgoMap, Layer, WMTSDataSource } from '@igo2/geo';

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
      color: [0, 153, 255, 0.15]
    }),
    image: new olstyle.Circle({
      radius: 6,
      color: [0, 153, 255, 0.15],
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
    if (!(dataSource instanceof WMTSDataSource) || !layer.visible) {
      return acc;
    }

    const layerName = dataSource.options.layer;
    if (layerName.startsWith('Mosaiques-orthophotos_') || layerName.startsWith('orthos')) {
      acc.push(layerName);
    }

    return acc;
  }, []);

  const anneeRegex = new RegExp(/^([1-9][\d]{3})$/);
  const anneeImages = imageLayerNames.reduce((acc: number[], layerName: string) => {
    const anneeText = layerName.slice(-4);
    if (anneeRegex.test(anneeText)) {
      acc.push(parseInt(anneeText, 10));
    }
    return acc;
  }, []);

  return anneeImages.length === 1 ? anneeImages[0] : undefined;
}
