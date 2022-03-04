import {
  APP_INITIALIZER,
  InjectionToken,
  NgModule,
  ModuleWithProviders,
  Provider
} from '@angular/core';

import { Tool, ToolService } from '@igo2/common';
import {
  CONFIG_OPTIONS,
  IgoCoreModule,
  RouteService,
  ConfigOptions,
  ConfigService,
  LanguageService,
  MessageService,
} from '@igo2/core';

import {
  CatalogBrowserToolComponent,
  CatalogLibraryToolComponent,
  ContextManagerToolComponent,
  ImportExportToolComponent,
  MapDetailsToolComponent,
  MapLegendToolComponent,
  MapToolComponent,
  MapToolsComponent,
  MeasurerToolComponent,
  SearchResultsToolComponent
} from '@igo2/integration';

import { FadqLibApiModule } from './api/api.module';
import { FadqLibDomainModule } from './domain/domain.module';

export let CONFIG_LOADER = new InjectionToken<Promise<ConfigService>>('Config Loader');
export let TOOL_LOADER = new InjectionToken<Promise<Tool>>('Tool Config');
export let TOOL_CONFIG = new InjectionToken<Promise<Tool>>('Tool Loader');

function configLoader(
  configService: ConfigService,
  configOptions: ConfigOptions,
): Promise<unknown> {
  const promiseOrTrue = configService.load(configOptions);
  if (promiseOrTrue instanceof Promise) {
    return promiseOrTrue;
  }
  return Promise.resolve();
}


function toolLoader(
  toolsConfigs: Tool[],
): Promise<void> {
  toolsConfigs.forEach((toolConfig) => {
    ToolService.register(toolConfig);
  });
  return Promise.resolve();
}


function appInitializerFactory(
  configLoader: Promise<unknown>,
  toolLoader: Promise<void>,
  languageService: LanguageService,
  messageService: MessageService,
) {
  return () => new Promise<any>((resolve: any) => {
    configLoader.then(() => {
      const promises = [
        languageService.translate.getTranslation(languageService.getLanguage())
      ];
      Promise.all(promises).then(() => resolve());
    });
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
    provide: TOOL_LOADER,
    useFactory: toolLoader,
    deps: [TOOL_CONFIG],
  },
  {
    provide: APP_INITIALIZER,
    useFactory: appInitializerFactory,
    deps: [CONFIG_LOADER, TOOL_LOADER, LanguageService, MessageService],
    multi: true
  },
  {
    provide: TOOL_CONFIG,
    useValue: {
      name: 'catalogBrowser',
      title: 'igo.integration.tools.catalog',
      icon: 'photo-browser',
      parent: 'catalog',
      component: CatalogBrowserToolComponent
    },
    multi: true
  },
  {
    provide: TOOL_CONFIG,
    useValue: {
      name: 'catalog',
      title: 'igo.integration.tools.catalog',
      icon: 'layers-plus',
      component: CatalogLibraryToolComponent
    },
    multi: true
  },
  {
    provide: TOOL_CONFIG,
    useValue: {
      name: 'contextManager',
      title: 'igo.integration.tools.contexts',
      icon: 'star',
      component: ContextManagerToolComponent
    },
    multi: true
  },
  {
    provide: TOOL_CONFIG,
    useValue: {
      name: 'importExport',
      title: 'igo.integration.tools.importExport',
      icon: 'file-move',
      component: ImportExportToolComponent
    },
    multi: true
  },
  {
    provide: TOOL_CONFIG,
    useValue: {
      name: 'mapDetails',
      title: 'igo.integration.tools.map',
      icon: 'map',
      component: MapDetailsToolComponent
    },
    multi: true
  },
  {
    provide: TOOL_CONFIG,
    useValue: {
      name: 'mapLegend',
      title: 'igo.integration.tools.legend',
      icon: 'format-list-bulleted-type',
      component: MapLegendToolComponent
    },
    multi: true
  },
  {
    provide: TOOL_CONFIG,
    useValue: {
      name: 'map',
      title: 'igo.integration.tools.map',
      icon: 'map',
      component: MapToolComponent
    },
    multi: true
  },
  {
    provide: TOOL_CONFIG,
    useValue: {
      name: 'mapTools',
      title: 'igo.integration.tools.map',
      icon: 'map',
      component: MapToolsComponent
    },
    multi: true
  },
  {
    provide: TOOL_CONFIG,
    useValue: {
      name: 'measurer',
      title: 'igo.integration.tools.measurer',
      icon: 'ruler',
      component: MeasurerToolComponent
    },
    multi: true
  },
  {
    provide: TOOL_CONFIG,
    useValue: {
      name: 'searchResults',
      title: 'igo.integration.tools.searchResults',
      icon: 'magnify',
      component: SearchResultsToolComponent
    },
    multi: true
  },
];

@NgModule({
  imports: [
    IgoCoreModule.forRoot(),
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
