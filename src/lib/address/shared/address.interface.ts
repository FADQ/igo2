import { Feature } from '@igo2/geo';
import { FeatureWithAddressProperties } from 'src/app/modules/address';
export interface AddressApiConfig {
  list: string;
  points: string;
}

export interface Address extends Feature {
  properties: FeatureWithAddressProperties;
}
export interface AddressProperties {
  buildingNumber: number;
  suffix?: string;
}

export interface AddressFeature extends Feature {
  properties: {
    idAdresseLocalisee: string;
    noAdresse: number;
    suffixeNoCivique: string;
  };
}

export interface AddressFeatureResponseItem extends AddressFeature {}

export type AddressFeatureList = AddressFeatureResponseItem[];
export interface AddressFeatureListResponse {
  data: AddressFeatureList;
}
