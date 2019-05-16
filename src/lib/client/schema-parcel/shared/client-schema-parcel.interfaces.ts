import {
  ClientSchemaElement,
  ClientSchemaElementProperties
} from '../../schema-element/shared/client-schema-element.interfaces';

export interface ClientSchemaParcelProperties extends ClientSchemaElementProperties {}

export type ClientSchemaParcel = ClientSchemaElement<ClientSchemaParcelProperties>;
