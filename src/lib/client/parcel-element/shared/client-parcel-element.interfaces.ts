import { EntityTransaction } from '@igo2/common';
import { Feature, FeatureMeta } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';

export interface ClientParcelElementApiConfig {
  list: string;
  save: string;
}

export interface ClientParcelElementProperties {
  id: string;
  noParcelleAgricole: string;
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
  remarque: string;
}

export interface ClientParcelElementMeta extends FeatureMeta {
  errors?: string[];
}

export interface ClientParcelElement extends Feature {
  properties: ClientParcelElementProperties;
  meta: ClientParcelElementMeta;
}

export interface ClientParcelElementListResponseItem extends ClientParcelElement {}

export type ClientParcelElementListResponse = ClientParcelElementListResponseItem[];

export interface ClientParcelElementTransactionWrapper {
  client: Client;
  transaction: EntityTransaction;
  proceed: () => void;
  abort?: () => void;
}
