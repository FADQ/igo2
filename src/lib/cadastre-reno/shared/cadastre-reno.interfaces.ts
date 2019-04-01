
import { Feature } from '@igo2/geo';

export interface CadastreRenoFeature extends Feature {
  properties: {
    noCadastre: number,
    xMin: number,
    yMin: number,
    xMax: number,
    yMax: number,
    xCenter: number,
    yCenter: number
  };
}

export interface CadastreRenoFeatureResponseItem extends CadastreRenoFeature {}

export interface CadastreRenoFeatureResponse {
  data: CadastreRenoFeatureResponseItem;
}

