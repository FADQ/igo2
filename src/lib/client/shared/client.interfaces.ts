import { ClientInfo, ClientInfoApiConfig } from '../info';
import { ClientParcel, ClientParcelDiagram, ClientParcelApiConfig } from '../parcel';
import { ClientParcelElementApiConfig } from '../parcel-element';
import { ClientSchema, ClientSchemaApiConfig } from '../schema';
import { ClientSchemaFileApiConfig } from '../schema-file';
import { ClientSchemaElementApiConfig } from '../schema-element';

export interface ClientApiConfig {
  info: ClientInfoApiConfig;
  parcel: ClientParcelApiConfig;
  parcelElement: ClientParcelElementApiConfig;
  schema: ClientSchemaApiConfig;
  schemaFile: ClientSchemaFileApiConfig;
  schemaElement: ClientSchemaElementApiConfig;
}

export class ClientRef {
  info: ClientInfo;
}

export interface Client extends ClientRef {}
