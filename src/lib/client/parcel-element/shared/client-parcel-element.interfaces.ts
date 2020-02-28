import { EntityTransaction } from '@igo2/common';
import { Feature } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientInfoGetResponseData } from '../../info/shared/client-info.interfaces';

export interface ClientParcelElementApiConfig {
  list: string;
  save: string;
  validateTransfer: string;
  transfer: string;
  parcelsWithoutOwner: string;
  domains: {
    source: string;
    statutAugm: string;
  };
}

export interface ClientParcelElementMessage {
  severite: string;
  id: string;
  libelle: string;
}

export interface ClientParcelElementProperties {
  idParcelle: number;
  noParcelleAgricole: string;
  typeParcelle: string;
  anneeImage: number;
  infoLocateur: string;
  noDiagramme: number;
  indParcelleDrainee: string;
  sourceParcelleAgricole: string;
  statutAugmentationSupCultivable: string;
  superficie: number;
  superficieHectare: number;
  timbreMaj: string;
  usagerMaj: string;
  messages: ClientParcelElementMessage[];
  noOwner?: boolean;
}

export interface ClientParcelElement extends Feature {
  properties: ClientParcelElementProperties;
}

export interface ClientParcelElementListResponseItem extends ClientParcelElement {}

export interface ClientParcelElementListResponse {
  statut: number;
  data: ClientParcelElementListResponseItem[];
}

export type ClientParcelElementWithoutOwnerResponse = ClientParcelElementListResponseItem[];

export interface ClientParcelElementTransactionWrapper {
  client: Client;
  annee: number;
  transaction: EntityTransaction;
  proceed: () => void;
  abort?: () => void;
}

export interface ClientParcelElementSaveData {
  lstParcellesAjoutes: ClientParcelElement[];
  lstParcellesModifies: ClientParcelElement[];
  lstIdParcellesSupprimes: string[];
}

export interface ClientParcelElementValidateTransferResponse {
  statut: number;
  data: {
    transfertPossible: boolean;
  };
}
