
import { Feature } from 'src/lib/feature';

export interface MunApiConfig {
  list: string;
}

export interface Mun extends Feature {
  properties: {
    codeGeographique: string;
    nomMunicipalite: string;
    designationMunicipalite: string;
    nomRegionAdmAppartenance: string;
  };
}

export interface MunListResponseItem extends Mun {}

export type MunListResponse = MunListResponseItem[];

export interface MunNom {
  id: string;
  codeGeographique: string;
  nomMunicipalite: string;
  current: boolean;
}

export interface MunNomListResponse {
  data: MunNom[];
}

/*** Parcel Diagram ***/
export interface MunDiagram {
  id: number;
}
