import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core';

import { ApiService } from 'src/lib/core/api';

import { ClientParcelElementService } from './client-parcel-element.service';

export function clientParcelElementServiceFactory(
  http: HttpClient,
  apiService: ApiService,
  config: ConfigService
) {
  return new ClientParcelElementService(
    http,
    apiService,
    config.getConfig('client.api.parcelElement')
  );
}

export function provideClientParcelElementService() {
  return {
    provide: ClientParcelElementService,
    useFactory: clientParcelElementServiceFactory,
    deps: [HttpClient, ApiService, ConfigService]
  };
}
