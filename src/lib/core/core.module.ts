import { NgModule, ModuleWithProviders, Provider } from '@angular/core';

import { IgoCoreModule, RouteService, provideConfigOptions } from '@igo2/core';

import { environment } from 'src/environments/environment';
import { FadqLibApiModule } from './api/api.module';
import { FadqLibDomainModule } from './domain/domain.module';

const providers: Provider[] = [
  RouteService,
  provideConfigOptions({
    default: environment.igo,
    path: environment.configPath
  })
];

@NgModule({
  imports: [
    IgoCoreModule.forRoot(),
    FadqLibApiModule,
    FadqLibDomainModule
  ],
  declarations: [],
  exports: [
    IgoCoreModule,
    FadqLibApiModule,
    FadqLibDomainModule
  ]
})
export class FadqLibCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibCoreModule,
      providers: providers
    };
  }
}
