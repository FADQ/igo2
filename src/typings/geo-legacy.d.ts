declare module 'arcgis-rest-api' {

  export interface Feature {
    attributes?: Record<string, any>;
    geometry?: any;
    id?: string | number;
  }

  export interface FeatureSet {
    features: Feature[];
    spatialReference?: any;
  }

  export interface Geometry {
    type?: string;
    spatialReference?: any;
  }

  export interface Point extends Geometry {
    x: number;
    y: number;
    z?: number;
    m?: number;
  }

  export interface Polyline extends Geometry {
    paths: number[][][];
  }

  export interface Polygon extends Geometry {
    rings: number[][][];
  }

  export interface Multipoint extends Geometry {
    points: number[][];
  }

  export interface SpatialReferenceWkid {
    wkid: number;
    latestWkid?: number;
  }

  // 👇 AJOUT IMPORTANT
  export type HasZM = boolean;
  export type Position = number[];
}

declare module 'topojson-specification' {

  export interface Topology {
    type: "Topology";
    objects: Record<string, any>;
    arcs: number[][][];
    transform?: {
      scale: [number, number];
      translate: [number, number];
    };
  }

  export interface GeometryCollection {
    type: "GeometryCollection";
    geometries: GeometryObject[];
  }

  export interface GeometryObject {
    type: string;
    arcs?: any;
    coordinates?: any;
  }

  export interface Point extends GeometryObject {
    type: "Point";
    coordinates: number[];
  }

  export interface MultiPoint extends GeometryObject {
    type: "MultiPoint";
    coordinates: number[][];
  }

  export interface LineString extends GeometryObject {
    type: "LineString";
    coordinates: number[][];
  }

  export interface MultiLineString extends GeometryObject {
    type: "MultiLineString";
    coordinates: number[][][];
  }

  export interface Polygon extends GeometryObject {
    type: "Polygon";
    coordinates: number[][][];
  }

  export interface MultiPolygon extends GeometryObject {
    type: "MultiPolygon";
    coordinates: number[][][][];
  }
}
