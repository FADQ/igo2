import { ClientInfo, ClientInfoApiConfig } from '../info';
import { ClientParcelApiConfig } from '../parcel';
import { ClientParcelElementApiConfig } from '../parcel-element';
import { ClientSchemaApiConfig } from '../schema';
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

export class Client {
  info: ClientInfo;
  tx?: {
    date: string;
    annee: number;
  };
}
