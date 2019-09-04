import { fromExtent } from 'ol/geom/Polygon';
import OlGeoJSON from 'ol/format/GeoJSON';

import { IgoMap } from '@igo2/geo';

export function getGoogleMapsUrl(center: [number, number], zoom?: number, basemap = 'default') {
  const baseUrl = 'https://www.google.com/maps/@?api=1&map_action=map';
  let url = `${baseUrl}&center=${center[1]},${center[0]}&basemap=${basemap}`;

  // Zoom level 3 is similar to GM zoom level 7 so we add 4 to our zoom level
  if (zoom !== undefined) {
    url = `${url}&zoom=${zoom + 4}`;
  }

  return url;
}

/**
 * Gets map extent polygon of the view
 * @param projection The desired geometry projection of the extent geometry
 * @returns A geometry in the desired projection corresponding to the view extent
 */
export function getMapExtentPolygon(map: IgoMap, projection: string) {
  return new OlGeoJSON().writeGeometryObject(fromExtent(map.viewController.getExtent(projection)));
}
