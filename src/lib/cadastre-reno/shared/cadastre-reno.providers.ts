import { ConfigService } from '@igo2/core';

import { SearchSource } from '@igo2/geo';

import { HttpClient } from '@angular/common/http';
import { CadastreRenoSearchSource, CadastreRenoSearchResultFormatter } from './cadastre-reno.service';

/**
 * CadastreReno search source factory
 * @ignore
 */
export function cadastreRenoSearchSourceFactory(
  http: HttpClient,
  config: ConfigService,
  formatter: CadastreRenoSearchResultFormatter
) {
  return new CadastreRenoSearchSource(
    http,
    config.getConfig(`searchSources.${CadastreRenoSearchSource.id}`),
    formatter
  );
}

/**
 * Function that returns a provider for the client search source
 */
export function provideCadastreRenoSearchSource() {
  return {
    provide: SearchSource,
    useFactory: cadastreRenoSearchSourceFactory,
    multi: true,
    deps: [ConfigService]
  };
}
