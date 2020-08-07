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
  category: string;
  cultivar: string;
}

export interface ClientParcelPro extends ClientParcel {
  properties: ClientParcelProProperties;
}

export interface ClientParcelProProduction {
  code: string;
  desc: string;
  cultivars: string[];
}

export interface ClientParcelProCategory {
  code: string;
  desc: string;
  color: [number, number, number];
  productions: string[];
}
