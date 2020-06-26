import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core';

import { ApiService } from 'src/lib/core/api';

import { ClientParcelTxService } from './client-parcel-tx.service';


export function clientParcelTxServiceFactory(
  http: HttpClient,
  apiService: ApiService,
  config: ConfigService
) {
  return new ClientParcelTxService(
    http,
    apiService,
    config.getConfig('client.api.parcelTx')
  );
}

export function provideClientParcelTxService() {
  return {
    provide: ClientParcelTxService,
    useFactory: clientParcelTxServiceFactory,
    deps: [HttpClient, ApiService, ConfigService]
  };
}
