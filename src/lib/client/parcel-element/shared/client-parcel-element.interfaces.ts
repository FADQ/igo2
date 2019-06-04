import { EntityTransaction } from '@igo2/common';
import { Feature } from '@igo2/geo';

export interface ClientParcelElementApiConfig {
  list: string;
}

// import { ClientParcelProperties } from '../../parcel/shared/client-parcel.interfaces';

// export interface ClientParcelElementProperties extends ClientParcelProperties {
//  noParcelleAgricole: string;
// }

export interface ClientParcelElementProperties {
  id: string; 
  noParcelleAgricole: string;
  timbreMaj: string;
  usagerMaj: string;
}

export interface ClientParcelElement extends Feature {
  properties: ClientParcelElementProperties;
}

export interface ClientParcelElementListResponseItem extends ClientParcelElement {}

export type ClientParcelElementListResponse = ClientParcelElementListResponseItem[];

export interface ClientParcelElementTransactionWrapper {
  transaction: EntityTransaction;
  proceed: () => void;
  abort?: () => void;
}
