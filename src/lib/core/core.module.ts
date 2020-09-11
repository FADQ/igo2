import { NgModule, ModuleWithProviders, Provider } from '@angular/core';

import { IgoCoreModule, RouteService } from '@igo2/core';

import { FadqLibApiModule } from './api/api.module';
import { FadqLibDomainModule } from './domain/domain.module';

const providers: Provider[] = [
  RouteService
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
  static forRoot(): ModuleWithProviders<FadqLibCoreModule> {
    return {
      ngModule: FadqLibCoreModule,
      providers: providers
    };
  }
}
