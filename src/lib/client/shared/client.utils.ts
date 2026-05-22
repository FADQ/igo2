import * as olstyle from 'ol/style';

import { AnyLayer, IgoMap, WMSDataSource, WMTSDataSource } from '@igo2/geo';

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

export function getAnneeImageFromMap(
  map: IgoMap
): number | undefined {

  const anneeRegex = /(19|20)\d{2}/;

  const layers: AnyLayer[] = map.layers || [];

  console.log('MAP LAYERS', layers);

  const years = layers.reduce(
    (acc: number[], layer: AnyLayer) => {

      const dataSource = layer.dataSource;

      const isImageLayer =
        dataSource instanceof WMTSDataSource ||
        dataSource instanceof WMSDataSource;

      if (!isImageLayer || !layer.visible) {
        return acc;
      }

      let layerName: string | undefined;

      if (dataSource instanceof WMTSDataSource) {

        layerName = dataSource.options.layer;

      } else if (dataSource instanceof WMSDataSource) {

        layerName = dataSource.options.params?.LAYERS;
      }

      console.log({
        layerName,
        visible: layer.visible,
        isImageLayer
      });

      if (
        layerName &&
        layerName.startsWith('Mosaiques-orthophotos')
      ) {

        const match = layerName.match(anneeRegex);

        if (match?.[0]) {

          const year =
            parseInt(match[0], 10);

          if (!isNaN(year)) {
            acc.push(year);
          }
        }
      }

      return acc;
    },
    []
  );

  console.log('IMAGE YEARS', years);

  return years.length > 0
    ? Math.max(...years)
    : undefined;
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
