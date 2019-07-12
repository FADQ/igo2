import { HttpClient } from '@angular/common/http';

import { ConfigService, LanguageService } from '@igo2/core';
import { FormService } from '@igo2/common';

import { ApiService } from 'src/lib/core/api';
import { DomainService } from 'src/lib/core/domain';

import { ClientSchemaService } from './client-schema.service';
import { ClientSchemaFormService } from './client-schema-form.service';

export function clientSchemaServiceFactory(
  http: HttpClient,
  apiService: ApiService,
  config: ConfigService
) {
  return new ClientSchemaService(
    http,
    apiService,
    config.getConfig('client.api.schema')
  );
}

export function provideClientSchemaService() {
  return {
    provide: ClientSchemaService,
    useFactory: clientSchemaServiceFactory,
    deps: [HttpClient, ApiService, ConfigService]
  };
}

export function clientSchemaFormServiceFactory(
  formService: FormService,
  apiService: ApiService,
  domainService: DomainService,
  languageService: LanguageService,
  config: ConfigService
) {
  return new ClientSchemaFormService(
    formService,
    apiService,
    domainService,
    languageService,
    config.getConfig('client.api.schema')
  );
}

export function provideClientSchemaFormService() {
  return {
    provide: ClientSchemaFormService,
    useFactory: clientSchemaFormServiceFactory,
    deps: [FormService, ApiService, DomainService, LanguageService, ConfigService]
  };
}
