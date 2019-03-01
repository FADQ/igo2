import { HttpClient } from '@angular/common/http';
import { ConfigService } from '@igo2/core';
import { ApiService } from 'src/lib/core/api';
import { MunService } from './mun.service';

export function munServiceFactory(
  http: HttpClient,
  apiService: ApiService,
  config: ConfigService
) {
  return new MunService(
    http,
    apiService,
    config.getConfig('geomatique.mun')
  );
}

export function provideMunService() {
  return {
    provide: MunService,
    useFactory: munServiceFactory,
    deps: [HttpClient, ApiService, ConfigService]
  };
}
