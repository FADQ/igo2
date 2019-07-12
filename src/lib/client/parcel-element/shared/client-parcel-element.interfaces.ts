import { EntityTransaction } from '@igo2/common';
import { Feature } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElementEditionState } from './client-parcel-element.enums';

export interface ClientParcelElementApiConfig {
  list: string;
  save: string;
  activateEdition: string;
  createEditionSchema: string;
  domains: {
    source: string;
    statutAugm: string;
  };
}

export interface ClientParcelElementMessage {
  type: string;
  text: string;
}

export interface ClientParcelElementProperties {
  idParcelle: string;
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

export interface ClientParcelElementActivateEditionResponse {
  statut: number;
  data: {
    resultat: ClientParcelElementEditionState;
  };
}

export interface ClientParcelElementSaveData {
  lstParcellesAjoutes: ClientParcelElement[];
  lstParcellesModifies: ClientParcelElement[];
  lstIdParcellesSupprimes: string[];
}
