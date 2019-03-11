import { Feature } from '@igo2/geo';
import { FeatureWithAddressProperties } from 'src/app/modules/address';
export interface Address extends Feature {
  properties: FeatureWithAddressProperties;
}
export interface AddressProperties {
  buildingNumber: number;
  suffix?: string;
}
