import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core';

import { ApiService } from '../../../lib/core';

import { EditionService } from './edition.service';


export function editionServiceFactory(
  http: HttpClient,
  apiService: ApiService,
  config: ConfigService
) {
  return new EditionService(
    http,
    apiService,
    config.getConfig('edition')
  );
}

export function provideEditionService() {
  return {
    provide: EditionService,
    useFactory: editionServiceFactory,
    deps: [HttpClient, ApiService, ConfigService]
  };
}
