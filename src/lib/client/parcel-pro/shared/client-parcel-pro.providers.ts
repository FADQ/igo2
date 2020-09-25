import { HttpClient } from '@angular/common/http';

import { ConfigService, LanguageService } from '@igo2/core';
import { FormService } from '@igo2/common';

import { ApiService } from 'src/lib/core/api';
import { DomainService } from 'src/lib/core/domain';

import { ClientParcelProService } from './client-parcel-pro.service';
import { ClientParcelProFormService } from './client-parcel-pro-form.service';

export function clientParcelProServiceFactory(
  http: HttpClient,
  apiService: ApiService,
  config: ConfigService
) {
  return new ClientParcelProService(
    http,
    apiService,
    config.getConfig('client.api.parcelPro')
  );
}

export function provideClientParcelProService() {
  return {
    provide: ClientParcelProService,
    useFactory: clientParcelProServiceFactory,
    deps: [HttpClient, ApiService, ConfigService]
  };
}

export function clientParcelProFormServiceFactory(
  formService: FormService,
  apiService: ApiService,
  domainService: DomainService,
  languageService: LanguageService,
  config: ConfigService
) {
  return new ClientParcelProFormService(
    formService,
    apiService,
    domainService,
    languageService,
    config.getConfig('client.api.parcelPro')
  );
}

export function provideClientParcelProFormService() {
  return {
    provide: ClientParcelProFormService,
    useFactory: clientParcelProFormServiceFactory,
    deps: [FormService, ApiService, DomainService, LanguageService, ConfigService]
  };
}
