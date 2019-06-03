import { Feature } from '@igo2/geo';

export interface EditionResult {
  feature: Feature;
  error?: string;
}

export interface EditionSliceResult {
  features: Feature[];
  error?: string;
}
