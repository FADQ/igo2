// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { ContextServiceOptions } from '@igo2/context';
import { LanguageOptions } from '@igo2/core';
import { CatalogServiceOptions, SearchSourceOptions } from '@igo2/geo';

import { ApiConfig } from 'src/lib/core/api/api.interfaces';
import { ClientApiConfig } from 'src/lib/client/shared/client.interfaces';

export interface IgoEnvironment {
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
    }
    designationSec: {
      list: string
    }
    lot: {
      list: string
    }
  };
}

/* tslint:disable */
export const igoEnvironment: IgoEnvironment = {
  searchSources: {
    nominatim: {
      enabled: true,
      available: true,
      params: {
        limit: '5'
      }
    },
    icherche: {
      enabled: true,
      available: true,
      searchUrl: '/icherche/geocode',
      params: {
        type: 'adresse,code_postal,route,municipalite,mrc,region_administrative',
        limit: '5',
        geometrie: 'geom'
      }
    },
    datasource: {
      enabled: false,
      available: false,
      searchUrl: '/ilayer/search',
      params: {
        limit: '5'
      }
    }
  },
  language: {
    prefix: './locale/'
  },
  api: {
    url: '/app/interne'
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
        get: '/igolocalisation/recherche_client/obtenirInformationClient/${clientNum}',
        link: ''
      },
      parcel: {
        list: '/igolocalisation/recherche_client/obtenirParcellesProductionsClientAnnee/${clientNum}/${annee}',
        years: '/igolocalisation/recherche_client/obtenirAnneesTraitementParcelleAgricole'
      },
      schema: {
        list: '/igolocalisation/recherche_client/obtenirSchemasClient/${clientNum}',
        create: '/igoschema/edition_schema/ajouterSchema',
        update: '/igoschema/edition_schema/modifierSchema',
        delete: '/igoschema/edition_schema/supprimerSchema/${id}',
        duplicate: '/igoschema/edition_schema/copierSchema/${id}',
        domains: {
          type: '/igoschema/edition_schema/obtenirTypesSchemas',
          etat: '/igoschema/edition_schema/obtenirEtatsSchema'
        }
      },
      schemaFile: {
        list: '/igolocalisation/recherche_client/obtenirDocumentsSchema/${schemaId}',
        download: '/igolocalisation/recherche_client/obtenirDocumentSchema/${id}',
        create: '/igoschema/edition_schema/ajouterDocumentSchema/${schemaId}',
        delete: '/igoschema/edition_schema/supprimerDocumentSchema/${id}'
      },
      schemaElement: {
        save: '',
        points: '/igolocalisation/recherche_client/obtenirElementGeometriquePoint/${schemaId}',
        lines: '/igolocalisation/recherche_client/obtenirElementGeometriqueLigne/${schemaId}',
        surfaces: '/igolocalisation/recherche_client/obtenirElementGeometriqueSurface/${schemaId}',
        domains: {
          type: '/igoschema/edition_schema/obtenirTypesElementGeometriqueTypeSchema/${schemaType}'
        }
      }
    }
  },
  cadastre : {
    mun : {
      list: '/igolocalisation/recherche_cadastre_originaire/obtenirMunicipalites'
    },
    cadastre: {
      list: ''
    },
    designationSec: {
      list: ''
    },
    lot: {
      list: ''
    }
  }
};