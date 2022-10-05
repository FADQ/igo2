// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { ContextServiceOptions } from '@igo2/context';
import { LanguageOptions } from '@igo2/core';
import { CatalogServiceOptions, Projection, SearchSourceOptions } from '@igo2/geo';

import { ApiConfig } from 'src/lib/core/api/api.interfaces';
import { ContextApiConfig } from 'src/lib/context/shared/context.interfaces';
import { ClientApiConfig } from 'src/apps/pes/modules/client/shared/client.interfaces';

export interface IgoEnvironment {
  projections?: Projection[];
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
  customContext: {
    api: ContextApiConfig;
    saveEnabled: boolean;
  };
  importExport: {
    url: string;
  };
}

/* tslint:disable */
export const igoEnvironment: IgoEnvironment = {
  searchSources: {
    nominatim: {
      enabled: false,
      available: false
    },
    icherche: {
      enabled: true,
      available: true,
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/apis/icherche',
      params: {
        type: 'adresses,codes-postaux,municipalites,mrc,regadmin,lieux',
        limit: '5',
        geometrie: 'true'
      },
      settings: []
    },
    coordinatesreverse: {
      enabled: true,
      available: true
    },
    icherchereverse: {
      enabled: false,
      available: false,
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/apis/territoires',
      params: {
        type: 'adresses,municipalites,mrc,regadmin',
        limit: '5',
        geometry: '1',
        buffer: '10'
      }
    },
    datasource: {
      enabled: false,
      available: false
    },
    cadastre: {
      enabled: false,
      available: false
    }
  },
  language: {
    prefix: './locale/'
  },
  api: {
    url: ''
  },
  help: {
    logoLink: 'assets/images/logo_igo_text_md.png',
    guideLink: '',
    newsLink: ''
  },
  layer: {
    infoLink: ''
  },
  client: {
    api: {
      info: {
        get: '',
        addresses: '',
        link: ''
      },
      parcel: {
        list: '',
        years: ''
      }
    }
  },
  customContext : {
    api: {
      save: ''
    },
    saveEnabled: false
  },
  importExport: {
    url: ''
  }
};
