import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core';

import { SearchSource } from './source';
import { IChercheSearchSource, IChercheReverseSearchSource } from './icherche';

export function ichercheSearchSourceFactory(
  http: HttpClient,
  config: ConfigService
) {
  return new IChercheSearchSource(
    http,
    config.getConfig(`searchSources.${IChercheSearchSource.id}`)
  );
}

export function provideIChercheSearchSource() {
  return {
    provide: SearchSource,
    useFactory: ichercheSearchSourceFactory,
    multi: true,
    deps: [HttpClient, ConfigService]
  };
}

export function ichercheReverseSearchSourceFactory(
  http: HttpClient,
  config: ConfigService
) {
  return new IChercheReverseSearchSource(
    http,
    config.getConfig(`searchSources.${IChercheReverseSearchSource.id}`)
  );
}

export function provideIChercheReverseSearchSource() {
  return {
    provide: SearchSource,
    useFactory: ichercheReverseSearchSourceFactory,
    multi: true,
    deps: [HttpClient, ConfigService]
  };
}
