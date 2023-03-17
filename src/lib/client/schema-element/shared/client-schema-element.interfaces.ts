import { Observable } from 'rxjs';

import { FormFieldSelectChoice, EntityTransaction } from '@igo2/common';
import { Feature } from '@igo2/geo';

import { TransactionData } from 'src/lib/utils/transaction';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';

export interface ClientSchemaElementApiConfig {
  savePoints: string;
  saveLines: string;
  saveSurfaces: string;
  points: string;
  lines: string;
  surfaces: string;
  getMostRecentImageYear: string;
  domains: {
    type: string;
  };
}

export interface ClientSchemaElementProperties {
  idElementGeometrique: string;
  etiquette: string;
  description: string;
  typeElement: string;
  descriptionTypeElement: string;
  anneeImage: number;
  timbreMaj: string;
  usagerMaj: string;
  idenUsagerMaj: string;
  superficie?: number;
}

export interface ClientSchemaElement<P = ClientSchemaElementProperties> extends Feature {
  properties: P;
}

export interface ClientSchemaElementListResponseItem extends ClientSchemaElement {}

export type ClientSchemaElementListResponse = ClientSchemaElementListResponseItem[];

export interface ClientSchemaElementType extends FormFieldSelectChoice {
  value: string;
  title: string;
  color: [number, number, number];
  icon?: string;
  geometryType?: string;
  order?: number;
}

export interface ClientSchemaElementTypes {
  Point: ClientSchemaElementType[];
  LineString: ClientSchemaElementType[];
  Polygon: ClientSchemaElementType[];
}

export interface ClientSchemaElementTypesResponse {
  data: {
    lstTypeElementPoint: ClientSchemaElementTypesResponseItem[];
    lstTypeElementLigne: ClientSchemaElementTypesResponseItem[];
    lstTypeElementSurface: ClientSchemaElementTypesResponseItem[];
  };
}

export interface ClientSchemaElementTypesResponseItem {
  idTypeElement: string;
  libelleFrancaisAbr: string;
  libelleFrancais?: string;
  libelleAnglaisAbr?: string;
  libelleAnglais?: string;
  ordreAffichage?: number;
  couleurElement?: string;
  iconeElement?: string;
}

export interface ClientSchemaElementTransactionWrapper {
  schema: ClientSchema;
  transaction: EntityTransaction;
  proceed: () => void;
  abort?: () => void;
}

export interface GetElements {
  getSchemaElements(schema: ClientSchema): Observable<ClientSchemaElement[]>;
}

export interface SaveElements {
  saveElements(schema: ClientSchema, data: TransactionData<ClientSchemaElement>): Observable<any>;
}

export interface ClientSchemaElementSaveData {
  lstElementsAjoutes: ClientSchemaElement[];
  lstElementsModifies: ClientSchemaElement[];
  lstIdElementsSupprimes: string[];
}
