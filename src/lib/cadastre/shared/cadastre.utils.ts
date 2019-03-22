
import { FeatureDataSource, VectorLayer, createOverlayMarkerStyle } from '@igo2/geo';
import * as olstyle from 'ol/style';

/**
 *Create a polygon layer to be added to the map.
 *
 * @export
 * @param fillColor
 * @param strokeColor
 * @param strokeWidth
 * @returns VectorLayer
 */
export function cratePolygonLayer(fillColor: string, strokeColor: string, strokeWidth: number): VectorLayer {

  const source: FeatureDataSource = new FeatureDataSource();
  const layer: VectorLayer = new VectorLayer({
    // id: 'Cadastre',
    // zIndex: 200,
    source,
    style: createPolygonLayerStyle(fillColor, strokeColor, strokeWidth)
  });
  return layer;
}

  /**
   *
   * Create a style for a polygon layer
   * @param fillColor
   * @param strokeColor
   * @param strokeWidth
   * @returns OL style
   */
  function createPolygonLayerStyle(fillColor: string, strokeColor: string, strokeWidth: number): olstyle.Style {
    return new olstyle.Style({
      stroke: new olstyle.Stroke({
        color: strokeColor,
        width: strokeWidth
      }),
      fill:  new olstyle.Fill({
        color: fillColor
      })
    });
  }

/**
 *Create a marker layer to be added to the map.
 *
 * @export
 * @returns VectorLayer
 */
export function createMarkerLayer(colorMarker: string): VectorLayer {

  const source: FeatureDataSource = new FeatureDataSource();
  const layer: VectorLayer = new VectorLayer({
    // id: 'Cadastre',
    // zIndex: 200,
    source,
    style: createOverlayMarkerStyle(colorMarker)
  });
  return layer;
}


