
import { Feature } from '@igo2/geo';

/**
 * Api config municipality interface
 */
export interface MunApiConfig {
  list: string;
}

/**
 * Municipality interface extending feature
 */
export interface Mun extends Feature {
  properties: {
    codeGeographique: string;
    nomMunicipalite: string;
    designationMunicipalite: string;
    nomRegionAdmAppartenance: string;
  };
}

/**
 * Municipality interface for the service response
 */
export interface MunListResponseItem extends Mun {}

/**
 * List of municipality response service
 */
export type MunListResponse = MunListResponseItem[];

/**
 * List box municipality interface
 */
export interface MunNom {
  id: string;
  codeGeographique: string;
  nomMunicipalite: string;
  current: boolean;
}

/**
 * List of municipality response service
 */
export interface MunNomListResponse {
  data: MunNom[];
}
