import { strEnum } from '@igo2/utils';

export const ClientParcelElementEditionState = strEnum(['AI', 'EEC', 'CREE', 'OK']);
export type ClientParcelElementEditionState = keyof typeof ClientParcelElementEditionState;
