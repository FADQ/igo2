import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';

import { ConfigService, LanguageService, StorageService } from '@igo2/core';
import {
  SearchSource,
  IChercheSearchSource,
  IChercheSearchResultFormatter,
  IChercheReverseSearchSource
} from '@igo2/geo';

import { FadqIChercheSearchResultFormatter } from './icherche';

/**
 * IMPORTANT: It appaers that we have to define our own providers for the search sources
 * to work properly (prod build only). Th providers are exactly like those in igo2-lib so that's weird.
 */

/**
 * ICherche search source factory
 * @ignore
 */
export function fadqIChercheSearchResultFormatterFactory(
  languageService: LanguageService
) {
  return new FadqIChercheSearchResultFormatter(languageService);
}

/**
 * Function that returns a provider for the ICherche search source
 */
export function provideFadqIChercheSearchResultFormatter() {
  return {
    provide: IChercheSearchResultFormatter,
    useFactory: fadqIChercheSearchResultFormatterFactory,
    deps: [LanguageService]
  };
}

/**
 * ICherche search source factory
 * @ignore
 */
export function ichercheSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  storageService: StorageService,
  config: ConfigService,
  formatter: IChercheSearchResultFormatter,
  injector: Injector
) {
  return new IChercheSearchSource(
    http,
    languageService,
    storageService,
    config.getConfig(`searchSources.${IChercheSearchSource.id}`),
    formatter,
    injector
  );
}

/**
 * Function that returns a provider for the ICherche search source
 */
export function provideIChercheSearchSource() {
  return {
    provide: SearchSource,
    useFactory: ichercheSearchSourceFactory,
    multi: true,
    deps: [
      HttpClient,
      LanguageService,
      StorageService,
      ConfigService,
      IChercheSearchResultFormatter,
      Injector
    ]
  };
}

/**
 * IChercheReverse search source factory
 * @ignore
 */
export function ichercheReverseSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  storageService: StorageService,
  config: ConfigService,
  injector: Injector
) {
  return new IChercheReverseSearchSource(
    http,
    languageService,
    storageService,
    config.getConfig(`searchSources.${IChercheReverseSearchSource.id}`),
    injector
  );
}

/**
 * Function that returns a provider for the IChercheReverse search source
 */
export function provideIChercheReverseSearchSource() {
  return {
    provide: SearchSource,
    useFactory: ichercheReverseSearchSourceFactory,
    multi: true,
    deps: [
      HttpClient,
      LanguageService,
      StorageService,
      ConfigService,
      Injector
    ]
  };
}
