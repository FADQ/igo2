import {
  ClientInfoApiConfig,
  ClientParcelApiConfig,
  ClientParcelElementApiConfig,
  ClientSchemaApiConfig,
  ClientSchemaFileApiConfig,
  ClientSchemaElementApiConfig
} from 'src/lib/client';

export interface ClientApiConfig {
  info: ClientInfoApiConfig;
  parcel: ClientParcelApiConfig;
  parcelElement: ClientParcelElementApiConfig;
  schema: ClientSchemaApiConfig;
  schemaFile: ClientSchemaFileApiConfig;
  schemaElement: ClientSchemaElementApiConfig;
}
