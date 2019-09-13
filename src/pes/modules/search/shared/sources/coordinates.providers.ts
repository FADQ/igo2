import { ConfigService} from '@igo2/core';
import { SearchSource, CoordinatesReverseSearchSource } from '@igo2/geo';

/**
 * Coordinates search source factory
 * @ignore
 */
export function coordinatesReverseSearchSourceFactory(
  config: ConfigService
) {
  return new CoordinatesReverseSearchSource(
    config.getConfig(`searchSources.${CoordinatesReverseSearchSource.id}`)
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
    deps: [ConfigService]
  };
}
