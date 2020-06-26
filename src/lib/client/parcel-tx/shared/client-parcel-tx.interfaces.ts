import { ClientInfoGetResponseData } from '../../info/shared/client-info.interfaces';
import { ClientParcelTxState } from './client-parcel-tx.enums';

export interface ClientParcelTxApiConfig {
  start: string;
  create: string;
  delete: string;
  clients: string;
  reconciliate: string;
  reconciliateClients: string;
}

export interface ClientParcelTxActivateResponse {
  statut: number;
  data: {
    resultat: ClientParcelTxState;
  };
}

export interface ClientInReconciliationResponseData {
  numeroClient: string;
  nomClient: string;
}

export interface ClientInReconciliationResponse {
  data: ClientInfoGetResponseData[];
}

export interface ClientsInParcelTxGetResponse {
  data: ClientInParcelTx[];
}

export interface ClientInParcelTx {
  noClient: string;
  nomClient: string;
  annee: number;
  dateCreation: {
    date: string;
  };
}
