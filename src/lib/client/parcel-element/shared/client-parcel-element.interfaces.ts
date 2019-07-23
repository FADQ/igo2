import { EntityTransaction } from '@igo2/common';
import { Feature } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientInfoGetResponseData } from '../../info/shared/client-info.interfaces';
import { ClientParcelElementTxState } from './client-parcel-element.enums';

export interface ClientParcelElementApiConfig {
  list: string;
  save: string;
  reconciliate: string;
  reconciliateClients: string;
  validateTransfer: string;
  transfer: string;
  startTx: string;
  createTx: string;
  deleteTx: string;
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
  parcelleDrainee: string;
  sourceParcelleAgricole: string;
  statutAugmentationSupCultivable: string;
  superficie: number;
  superficieHectare: number;
  timbreMajGeometrie: string;
  usagerMajGeometrie: string;
  messages: ClientParcelElementMessage[];
}

export interface ClientParcelElement extends Feature {
  properties: ClientParcelElementProperties;
}

export interface ClientParcelElementListResponseItem extends ClientParcelElement {}

export interface ClientParcelElementListResponse {
  statut: number;
  data: ClientParcelElementListResponseItem[];
}

export interface ClientParcelElementTransactionWrapper {
  client: Client;
  annee: number;
  transaction: EntityTransaction;
  proceed: () => void;
  abort?: () => void;
}

export interface ClientParcelElementActivateTxResponse {
  statut: number;
  data: {
    resultat: ClientParcelElementTxState;
  };
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

export type ClientInReconciliationResponseData = ClientInfoGetResponseData;

export interface ClientInReconciliationResponse {
  data: ClientInfoGetResponseData[];
}
