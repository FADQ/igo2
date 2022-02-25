import {
  APP_INITIALIZER,
  InjectionToken,
  NgModule,
  ModuleWithProviders,
  Provider,
} from '@angular/core';

import {
  CONFIG_OPTIONS,
  IgoCoreModule,
  RouteService,
  ConfigOptions,
  ConfigService,
  LanguageService,
} from '@igo2/core';

import { FadqLibApiModule } from './api/api.module';
import { FadqLibDomainModule } from './domain/domain.module';

export let CONFIG_LOADER = new InjectionToken<Promise<ConfigService>>('configLoader');


function configLoader(
  configService: ConfigService,
  configOptions: ConfigOptions,
) {
  return configService.load(configOptions);
}


function appInitializerFactory(
  configLoader: Promise<ConfigService>,
  languageService: LanguageService,
) {
  return () => new Promise<any>((resolve: any) => {
    configLoader.then((configService) => {
      const promises = [
        languageService.translate.getTranslation(languageService.getLanguage())
      ];
      Promise.all(promises).then(() => resolve())
    })
  });
}

const providers: Provider[] = [
  RouteService,
  {
    provide: CONFIG_LOADER,
    useFactory: configLoader,
    deps: [ConfigService, CONFIG_OPTIONS],
  },
  {
    provide: APP_INITIALIZER,
    useFactory: appInitializerFactory,
    deps: [CONFIG_LOADER, LanguageService],
    multi: true
  }
];


@NgModule({
  imports: [
    IgoCoreModule,
    FadqLibApiModule,
    FadqLibDomainModule,
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
