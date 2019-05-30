import { Feature } from '@igo2/geo';

export interface EditionResult {
  feature: Feature;
  error?: string;
}

export interface EditionSlicerResult {
  features: Feature[];
  error?: string;
}
