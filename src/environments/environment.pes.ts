import { IgoEnvironment, igoEnvironment } from './environment.partial';

interface Environment {
  production: boolean;
  configPath: string;
  igo: IgoEnvironment;
}

/* tslint:disable */
export const environment: Environment = {
  production: true,
  configPath: './config/pes.json',
  igo: igoEnvironment
};
