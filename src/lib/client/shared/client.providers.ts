import { ConfigService } from '@igo2/core';

import { ClientInfoService } from '../info';
import { ClientParcelService } from '../parcel';
import { ClientSchemaService } from '../schema';

import { ClientService } from './client.service';

export function clientServiceFactory(
  clientInfoService: ClientInfoService,
  clientParcelService: ClientParcelService,
  clientSchemaService: ClientSchemaService,
  configService: ConfigService
) {
  return new ClientService(
    clientInfoService,
    clientParcelService,
    clientSchemaService,
    configService
  );
}

export function provideClientService() {
  return {
    provide: ClientService,
    useFactory: clientServiceFactory,
    deps: [
      ClientInfoService,
      ClientParcelService,
      ClientSchemaService
    ]
  };
}
