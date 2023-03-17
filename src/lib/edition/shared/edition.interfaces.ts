import { Feature } from '@igo2/geo';

export interface EditionResult {
  feature: Feature;
  error?: string;
}

export interface EditionSliceResult {
  features: Feature[];
  error?: string;
}

export interface MessageErreur {
  libelle: string;
  severite: string;
}

export interface ErreurValidation {
  statut: number;
  data: any[];
  messages: MessageErreur[];
}

export interface EditionApiConfig {
  validGeometry: string;
}
