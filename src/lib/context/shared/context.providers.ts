import { HttpClient } from '@angular/common/http';
import { ConfigService } from '@igo2/core';

import { ApiService } from 'src/lib/core/api';
import { CustomContextService } from './context.service';

export function customContextServiceFactory(
  http: HttpClient,
  apiService: ApiService,
  config: ConfigService
) {
  return new CustomContextService(
    http,
    apiService,
    config.getConfig('customContext.api')
  );
}

export function provideCustomContextService() {
  return {
    provide: CustomContextService,
    useFactory: customContextServiceFactory,
    deps: [HttpClient, ApiService, ConfigService]
  };
}
