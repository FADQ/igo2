import { GeoJsonGeometryTypes } from 'geojson';
import { EntityObject } from 'src/app/modules/entity';

export interface Feature extends EntityObject {
  type: string;
  projection: string;
  geometry: FeatureGeometry;
  extent: [number, number, number, number];
  properties: { [key: string]: any };
}

export interface FeatureGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: any;
}
