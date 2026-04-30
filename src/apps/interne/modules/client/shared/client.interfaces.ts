import {
  ClientInfoApiConfig,
  ClientParcelApiConfig,
  ClientParcelElementApiConfig,
  ClientParcelTxApiConfig,
  ClientSchemaApiConfig,
  ClientSchemaFileApiConfig,
  ClientSchemaElementApiConfig
} from 'src/lib/client';

export interface ClientApiConfig {
  info: ClientInfoApiConfig;
  parcel: ClientParcelApiConfig;
  parcelElement: ClientParcelElementApiConfig;
  parcelTx: ClientParcelTxApiConfig;
  schema: ClientSchemaApiConfig;
  schemaFile: ClientSchemaFileApiConfig;
  schemaElement: ClientSchemaElementApiConfig;
}
