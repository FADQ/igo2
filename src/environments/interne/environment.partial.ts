// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { ContextServiceOptions } from '@igo2/context';
import { LanguageOptions } from '@igo2/core';
import { CatalogServiceOptions, Projection, SearchSourceOptions } from '@igo2/geo';

import { ApiConfig } from 'src/lib/core/api/api.interfaces';
import { ContextApiConfig } from 'src/lib/context/shared/context.interfaces';
import { ClientApiConfig } from 'src/apps/interne/modules/client/shared/client.interfaces';
import { HelpGuide } from 'src/apps/shared/modules/help/shared/help.interfaces';

export interface IgoEnvironment {
  projections?: Projection[];
  searchSources?: { [key: string]: SearchSourceOptions };
  language?: LanguageOptions;
  context?: ContextServiceOptions;
  catalog?: CatalogServiceOptions;
  api: ApiConfig;
  help: {
    guides: HelpGuide[];
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
    };
    cadastre: {
      list: string;
      surfaces: string;
    };
    concession: {
      list: string;
      points: string;
    };
    lot: {
      list: string;
      points: string;
    }
  };
  address: {
    list: string;
    save: string;
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
      enabled: true,
      available: true
    }
  },
  language: {
    prefix: './locale/'
  },
  api: {
    url: '/app/interne'
  },
  help: {
    guides: []
  },
  layer: {
    infoLink: ''
  },
  client: {
    api: {
      info: {
        get: '/igolocalisation/recherche_client/obtenirInformationClient/${clientNum}',
        addresses: '/igolocalisation/recherche_client/obtenirAdressesClient/${clientNum}',
        link: ''
      },
      parcel: {
        list: '/igolocalisation/recherche_client/obtenirParcellesProductionsClientAnnee/${clientNum}/${annee}',
        years: '/igolocalisation/recherche_client/obtenirAnneesTraitementParcelleAgricole'
      },
      parcelElement: {
        list: '/igodonneesgeospatiales/edition_parcelle_agricole/obtenirParcellesEdition/${clientNum}/${annee}',
        save: '/igodonneesgeospatiales/edition_parcelle_agricole/enregistrerParcellesEdition/${clientNum}/${annee}',
        validateTransfer: '/igodonneesgeospatiales/edition_parcelle_agricole/validertransfertparcelle/${toClientNum}/${annee}',
        transfer: '/igodonneesgeospatiales/edition_parcelle_agricole/transfererparcellesedition/${fromClientNum}/${toClientNum}/${annee}',
        parcelsWithoutOwner: '/igodonneesgeospatiales/edition_parcelle_agricole/obtenirParcellesSansDetenteur/${annee}',
        domains: {
          statutAugm: '/igodonneesgeospatiales/edition_parcelle_agricole/obtenirStatutsAugmentationSuperficiesCultivees',
          source: '/igodonneesgeospatiales/edition_parcelle_agricole/obtenirSourcesParcelles'
        }
      },
      parcelTx: {
        reconciliate: '/igodonneesgeospatiales/edition_parcelle_agricole/reconcilierParcellesEdition/${clientNum}/${annee}',
        reconciliateClients: '/igodonneesgeospatiales/edition_parcelle_agricole/obtenirliensclientsedition/${clientNum}',
        start: '/igodonneesgeospatiales/edition_parcelle_agricole/activeredition/${clientNum}/${annee}',
        create: '/igodonneesgeospatiales/edition_parcelle_agricole/creerSchemaEdition/${clientNum}/${annee}',
        delete: '/igodonneesgeospatiales/edition_parcelle_agricole/supprimerschema/${clientNum}/${annee}',
        clients: '/igolocalisation/recherche_client_schema_edition/obtenirclientsedition'
      },
      schema: {
        list: '/igolocalisation/recherche_client/obtenirSchemasClient/${clientNum}',
        create: '/igoschema/edition_schema/ajouterSchema',
        update: '/igoschema/edition_schema/modifierSchema',
        delete: '/igoschema/edition_schema/supprimerSchema/${id}',
        duplicate: '/igoschema/edition_schema/copierSchema/${id}',
        downloadMapLSE: '/igoschema/edition_schema/creerCartesStructureEntreposage/${clientNum}', 
        domains: {
          type: '/igoschema/edition_schema/obtenirTypesSchemas'
        }
      },
      schemaFile: {
        list: '/igolocalisation/recherche_client/obtenirDocumentsSchema/${schemaId}',
        download: '/igolocalisation/recherche_client/obtenirDocumentSchema/${id}',
        create: '/igoschema/edition_schema/ajouterDocumentSchema/${schemaId}',
        delete: '/igoschema/edition_schema/supprimerDocumentSchema/${id}'
      },
      schemaElement: {
        savePoints: '/igoschema/edition_schema/mettreAJourElementsGeometriquesPoint/${schemaId}',
        saveLines: '/igoschema/edition_schema/mettreAJourElementsGeometriquesLigne/${schemaId}',
        saveSurfaces: '/igoschema/edition_schema/mettreAJourElementsGeometriquesSurface/${schemaId}',
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
      list: '/igolocalisation/recherche_cadastre_originaire/obtenirCadastresOriginaires/${codeGeo}',
      surfaces: '/igolocalisation/recherche_cadastre_originaire/obtenirCadastreOriginaire/${idCadastre}'
    },
    concession: {
      list: '/igolocalisation/recherche_cadastre_originaire/obtenirDesignationSecondaire',
      points: '/igolocalisation/recherche_cadastre_originaire/obtenirDesDesignationsSecondairesOriginaires'
    },
    lot: {
      list: '/igolocalisation/recherche_cadastre_originaire/obtenirLotsOriginaires',
      points: '/igolocalisation/recherche_cadastre_originaire/obtenirDesLotsOriginaires'
    }
  },
  address : {
    list: '/igodonneesgeospatiales/edition_point_adresse/obtenirAdressesAQ',
    save: '/igodonneesgeospatiales/edition_point_adresse/modifierGeometrieAdresseQuebec/${idAdresseAQ}'
  },
  customContext : {
    api: {
      save: 'TODO'
    },
    saveEnabled: true
  },
  importExport: {
    url: ''
  }
};
