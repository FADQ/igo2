
import { Feature } from '@igo2/geo';

export interface CadastreRenoFeature extends Feature {
  properties: {
    "Numéro de Cadastre": string;
  };
}
