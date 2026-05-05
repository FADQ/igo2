import OlFeature from 'ol/Feature';
import OlSimpleGeometry from 'ol/geom/SimpleGeometry';

export function getOlTypes(olFeature: OlFeature<OlSimpleGeometry>): 'Point' | 'LineString' | 'Polygon' {
  const rawType = olFeature.getGeometry().getType();

  if (rawType.includes('Point')) return 'Point';
  if (rawType.includes('LineString')) return 'LineString';
  if (rawType.includes('Polygon')) return 'Polygon';

  throw new Error(`Unsupported geometry type: ${rawType}`);
}
