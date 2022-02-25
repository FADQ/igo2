import { DomainChoicesResponseItem } from 'src/lib/core/domain';

export interface ClientSchemaApiConfig {
  list: string;
  create: string;
  update: string;
  delete: string;
  duplicate: string;
  downloadMapLSE: string;
  domains: {
    type: string;
  };
}

export interface ClientSchema {
  id: string;
  numeroClient: string;
  type: string;
  descriptionType: string;
  description: string;
  annee: string;
  nbDocuments: number;
  usagerMaj: string;
  timbreMaj: {
    date: string;
  };
}

export interface ClientSchemaListResponse {
  data?: ClientSchemaListResponseItem[];
}

export interface ClientSchemaListResponseItem {
  id: string;
  numeroClient: string;
  typeSchema: DomainChoicesResponseItem;
  description: string;
  annee: string;
  nbDocuments: number;
  usagerMaj: string;
  timbreMaj: {
    date: string;
  };
}

export interface ClientSchemaCreateData {
  numeroClient: string;
  type: string;
  description: string;
  annee: string;
}

export interface ClientSchemaCreateResponse {
  data: ClientSchemaListResponseItem;
}

export interface ClientSchemaUpdateData {
  id: number;
  type: string;
  description: string;
  annee: string;
}

export interface ClientSchemaUpdateResponse {
  data: ClientSchemaListResponseItem;
}

export interface ClientSchemaTransferResponse {
  data: null;
  messages: string[];
}

export interface ClientSchemaDuplicateResponse {
  data: ClientSchemaListResponseItem;
}
