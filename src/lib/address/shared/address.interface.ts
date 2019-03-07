import { Feature } from '@igo2/geo';
import { IgoMap } from '@igo2/geo';

export interface Address {
  buildingNumber?: number;
  suffix?: String;
}

export interface FeatureWithAddress extends Feature<FeatureWithAddressProperties> {}

export interface FeatureWithAddressProperties {
  buildingNumber: number;
  suffix?: String;
}

export interface FeatureStoreAddressStrategyOptions {
  map: IgoMap;
}
