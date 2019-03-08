
import { Feature } from '@igo2/geo';

/**
 * Api config municipality interface
 */
export interface CadastreApiConfig {
  list: string;
}

/**
 * Cadastre interface
 */
export interface Cadastre {
  idCadastreOriginaire: number;
  nomCadastre: string;
  noCadastre: string;
  codeCadastre: string;
  recherche: string;
}

export interface CadastreName {
  idCadastreOriginaire: number;
  nomCadastre: string;
}

/**
 * Cadastre interface for the service response
 */
export interface CadastreResponseItem extends Cadastre {}


/**
 * List of cadastre response service
 */
export interface CadastreListResponse {
  data: Cadastre[];
}
