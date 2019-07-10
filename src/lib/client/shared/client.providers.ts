import { ClientInfoService } from '../info';

import { ClientService } from './client.service';

export function clientServiceFactory(
  clientInfoService: ClientInfoService
) {
  return new ClientService(
    clientInfoService
  );
}

export function provideClientService() {
  return {
    provide: ClientService,
    useFactory: clientServiceFactory,
    deps: [
      ClientInfoService
    ]
  };
}
