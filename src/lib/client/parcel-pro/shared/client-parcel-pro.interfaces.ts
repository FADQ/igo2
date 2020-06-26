import {
  ClientParcel,
  ClientParcelProperties
} from '../../parcel/shared/client-parcel.interfaces';

export interface ClientParcelProApiConfig {
  domains: {
    pro: string;
  };
}

export interface ClientParcelProProperties extends ClientParcelProperties {}

export interface ClientParcelPro extends ClientParcel {
  properties: ClientParcelProProperties;
}

export interface ClientParcelProGroup {
  production: string;
  color: [number, number, number];
  parcels: ClientParcelPro[];
}
