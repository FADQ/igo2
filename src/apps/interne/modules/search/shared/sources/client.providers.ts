import { ConfigService } from '@igo2/core';

import { SearchSource } from '@igo2/geo';

import { ClientService } from 'src/lib/client';
import { ClientSearchSource } from './client';

/**
 * Client search source factory
 * @ignore
 */
export function clientSearchSourceFactory(
  clientService: ClientService,
  config: ConfigService
) {
  return new ClientSearchSource(
    clientService,
    config.getConfig(`searchSources.${ClientSearchSource.id}`)
  );
}

/**
 * Function that returns a provider for the client search source
 */
export function provideClientSearchSource() {
  return {
    provide: SearchSource,
    useFactory: clientSearchSourceFactory,
    multi: true,
    deps: [ClientService, ConfigService]
  };
}
