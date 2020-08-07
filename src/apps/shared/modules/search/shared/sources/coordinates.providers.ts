import { ConfigService, LanguageService } from '@igo2/core';
import {
  Projection,
  SearchSource,
  CoordinatesReverseSearchSource,
  CoordinatesSearchResultFormatter
} from '@igo2/geo';

/**
 * Coordinates search source factory
 * @ignore
 */
export function coordinatesReverseSearchSourceFactory(
  config: ConfigService,
  languageService: LanguageService
) {
  return new CoordinatesReverseSearchSource(
    config.getConfig(`searchSources.${CoordinatesReverseSearchSource.id}`),
    languageService,
    (config.getConfig('projections') || [] as Projection[])
  );
}

/**
 * Function that returns a provider for the Coordinates search source
 */
export function provideCoordinatesReverseSearchSource() {
  return {
    provide: SearchSource,
    useFactory: coordinatesReverseSearchSourceFactory,
    multi: true,
    deps: [ConfigService, LanguageService]
  };
}

/**
 * Coordinates search result formatter factory
 * @ignore
 */
export function coordinatesSearchResultFormatterFactory(
  languageService: LanguageService
) {
  return new CoordinatesSearchResultFormatter(languageService);
}

/**
 * Function that returns a provider for the ICherche search result formatter
 */
export function provideCoordinatesSearchResultFormatter() {
  return {
    provide: CoordinatesSearchResultFormatter,
    useFactory: coordinatesSearchResultFormatterFactory,
    deps: [LanguageService]
  };
}
