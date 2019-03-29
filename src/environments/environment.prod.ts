import { IgoEnvironment, igoEnvironment } from './environment.partial';

interface Environment {
  production: boolean;
<<<<<<< HEAD
  configPath: string;
  igo: IgoEnvironment;
=======
  igo: {
    searchSources?: { [key: string]: SearchSourceOptions };
    language?: LanguageOptions;
    context?: ContextServiceOptions;
    catalog?: CatalogServiceOptions;
    api: ApiConfig;
    help: {
      logoLink: string;
      guideLink: string;
      newsLink: string;
    };
    client: {
      api: ClientApiConfig;
    };
    layer: {
      infoLink: string;
    };
    cadastre: {
      mun: {
        list: string;
      }
      cadastre: {
        list: string;
        surfaces: string
      }
      concession: {
        list: string;
        points: string
      }
      lot: {
        list: string;
        points: string
      }
    };
  };
>>>>>>> Add the cadastre choice in search bar and few other changes
}

/* tslint:disable */
export const environment: Environment = {
  production: true,
  configPath: './config/config.json',
  igo: igoEnvironment
};
