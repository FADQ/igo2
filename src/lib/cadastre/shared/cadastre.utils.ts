
import { FeatureDataSource, VectorLayer, createOverlayMarkerStyle } from '@igo2/geo';
import * as olstyle from 'ol/style';

/**
 *Create the cadastre layer to be added to the map.
 *
 * @export
 * @returns VectorLayer
 */
export function crateLayerCadastre(): VectorLayer {

    const source: FeatureDataSource = new FeatureDataSource();
    const layer: VectorLayer = new VectorLayer({
      // id: 'Cadastre',
      // zIndex: 200,
      source,
      style: createCadastreLayerStyle()
    });
    return layer;
  }

  /**
   * Create a default style for a cadastre
   * @returns OL style
   */
  function createCadastreLayerStyle(): olstyle.Style {
    return new olstyle.Style({
      stroke: new olstyle.Stroke({
        color: '#6efc02',
        width: 4
      }),
      fill:  new olstyle.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      })
    });
  }

  /**
 *Create the concession layer to be added to the map.
 *
 * @export
 * @returns VectorLayer
 */
export function crateLayerConcession(): VectorLayer {

  const source: FeatureDataSource = new FeatureDataSource();
  const layer: VectorLayer = new VectorLayer({
    // id: 'Cadastre',
    // zIndex: 200,
    source,
    style: createOverlayMarkerStyle('yellow')
  });
  return layer;
}


