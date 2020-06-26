import { HttpClient } from '@angular/common/http';

import { ConfigService, LanguageService } from '@igo2/core';
import { FormService } from '@igo2/common';

import { ApiService } from 'src/lib/core/api';
import { DomainService } from 'src/lib/core/domain';

import { ClientParcelElementService } from './client-parcel-element.service';
import { ClientParcelElementFormService } from './client-parcel-element-form.service';

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

export function clientParcelElementFormServiceFactory(
  formService: FormService,
  apiService: ApiService,
  domainService: DomainService,
  languageService: LanguageService,
  config: ConfigService
) {
  return new ClientParcelElementFormService(
    formService,
    apiService,
    domainService,
    languageService,
    config.getConfig('client.api.parcelElement')
  );
}

export function provideClientParcelElementFormService() {
  return {
    provide: ClientParcelElementFormService,
    useFactory: clientParcelElementFormServiceFactory,
    deps: [FormService, ApiService, DomainService, LanguageService, ConfigService]
  };
}
