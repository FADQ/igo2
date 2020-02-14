import { ClientInfo } from '../info';

export class Client {
  info: ClientInfo;
  tx?: {
    date: string;
    annee: number;
  };
}
