import { Feature } from '@igo2/geo';

export interface ClientParcelApiConfig {
  list: string;
  years: string;
}

export interface ClientParcelProperties {
  annee: string;
  anneeImage: number;
  codeDefautCultural: string;
  descriptionProduction: string;
  id: string;
  infoLocateur: string;
  noClientDetenteur: string;
  noClientExploitant: string;
  noClientRecherche: string;
  noConfirmation: number;
  noDiagramme: number;
  noParcelleAgricole: string;
  noParcelleAgricoleTri: string;
  parcelleDrainee: string;
  pourcentageDefautCultural: number;
  pourcentageSupMao: number;
  production: string;
  sourceParcelleAgricole: string;
  statutAugmentationSupCultivable: string;
  superficie: number;
  superficieDeclaree: number;
  superficieHectare: number;
  superficieMao: number;
  timbreMajGeometrie: string;
  typeParcelleAgricole: string;
  usagerMajGeometrie: string;
  relation: number;
}

export interface ClientParcel extends Feature {
  properties: ClientParcelProperties;
}

export interface ClientParcelListResponseItem extends ClientParcel {}

export type ClientParcelListResponse = ClientParcelListResponseItem[];

/*** Parcel Year ***/
export interface ClientParcelYear {
  id: string;
  annee: number;
  current: boolean;
}

export interface ClientParcelYearListResponseItem {
  idParametre: number;
  annee: number;
  indAnneeActive: boolean;
}

export interface ClientParcelYearListResponse {
  data: ClientParcelYearListResponseItem[];
}

/*** Parcel Diagram ***/
export interface ClientParcelDiagram {
  id: number;
}
