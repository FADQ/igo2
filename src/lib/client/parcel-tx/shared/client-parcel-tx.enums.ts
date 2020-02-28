import { strEnum } from '@igo2/utils';

export const ClientParcelTxState = strEnum(['AI', 'EEC', 'CREE', 'OK']);
export type ClientParcelTxState = keyof typeof ClientParcelTxState;
