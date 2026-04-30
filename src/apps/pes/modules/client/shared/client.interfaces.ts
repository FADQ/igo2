import {
  ClientInfoApiConfig,
  ClientParcelApiConfig
} from 'src/lib/client';

export interface ClientApiConfig {
  info: ClientInfoApiConfig;
  parcel: ClientParcelApiConfig;
}
