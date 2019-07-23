import { strEnum } from '@igo2/utils';

export const ClientParcelElementTxState = strEnum(['AI', 'EEC', 'CREE', 'OK']);
export type ClientParcelElementTxState = keyof typeof ClientParcelElementTxState;
