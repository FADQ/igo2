import {
  ClientParcel,
  ClientParcelProperties
} from '../../parcel/shared/client-parcel.interfaces';

export interface ClientParcelProApiConfig {
  domains: {
    pro: string;
  };
}

export interface ClientParcelProProperties extends ClientParcelProperties {
  prod: string;
}

export interface ClientParcelPro extends ClientParcel {
  properties: ClientParcelProProperties;
}
