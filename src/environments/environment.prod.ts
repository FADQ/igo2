import { ContextServiceOptions } from '@igo2/context';
import { LanguageOptions } from '@igo2/core';
import { CatalogServiceOptions } from '@igo2/geo';

import { ApiConfig } from '../app/modules/core/api/api.interface';
import { SearchSourceOptions } from '../app/modules/search/shared/sources/source.interface';

interface Environment {
  production: boolean;
  igo: {
    searchSources?: { [key: string]: SearchSourceOptions };
    language?: LanguageOptions;
    context?: ContextServiceOptions;
    catalog?: CatalogServiceOptions;
    api?: ApiConfig;
  };
}

export const environment: Environment = {
  production: true,
  igo: {
    searchSources: {
      nominatim: {
        enabled: true
      },
      icherche: {
        enabled: false,
        searchUrl: 'https://geoegl.msp.gouv.qc.ca/icherche/geocode'
      },
      datasource: {
        enabled: false,
        searchUrl: 'https://geoegl.msp.gouv.qc.ca/igo2/api/layers/search'
      }
    },
    language: {
      prefix: './locale/'
    },
    api: {
      url: 'http://chabou01-svn.fadq.qc/app/interne'
    }
  }
};
