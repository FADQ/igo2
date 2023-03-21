import {
  APP_INITIALIZER,
  Component,
  InjectionToken,
  NgModule,
  ModuleWithProviders,
  Provider
} from '@angular/core';
import { lastValueFrom } from 'rxjs'

import {
  FormFieldService,
  FormFieldSelectComponent,
  FormFieldTextComponent,
  FormFieldTextareaComponent,
  Tool,
  ToolService
} from '@igo2/common';
import {
  CONFIG_OPTIONS,
  IgoCoreModule,
  RouteService,
  ConfigOptions,
  ConfigService,
  LanguageService,
} from '@igo2/core';
import { GeometryFormFieldComponent } from '@igo2/geo';

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
export let FORM_FIELD_CONFIG = new InjectionToken<Promise<[string, Component]>>('Form Field Config');
export let FORM_FIELD_LOADER = new InjectionToken<Promise<void>>('Form Field Loader');
export let TOOL_CONFIG = new InjectionToken<Promise<Tool>>('Tool Loader');
export let TOOL_LOADER = new InjectionToken<Promise<void>>('Tool Config');

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

function formFieldLoader(
  formFields:  [[string, Component]],
): Promise<void> {
  formFields.forEach((formField) => {
    FormFieldService.register(formField[0], formField[1]);
  });
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
  formFieldLoader: Promise<void>,
  toolLoader: Promise<void>,
  languageService: LanguageService,
) {
  return () => new Promise<any>((resolve: any) => {
    configLoader.then(() => {
      const language = languageService.getLanguage();
      const promises = [
        lastValueFrom(languageService.translate.getTranslation(language))
      ];
      Promise.all(promises).then(() => resolve());
    });
  });
}

const providers: Provider[] = [
  RouteService,
  {
    provide: APP_INITIALIZER,
    useFactory: appInitializerFactory,
    deps: [CONFIG_LOADER, FORM_FIELD_LOADER, TOOL_LOADER, LanguageService],
    multi: true
  },
  {
    provide: CONFIG_LOADER,
    useFactory: configLoader,
    deps: [ConfigService, CONFIG_OPTIONS],
  },
  {
    provide: FORM_FIELD_LOADER,
    useFactory: formFieldLoader,
    deps: [FORM_FIELD_CONFIG],
  },
  {
    provide: FORM_FIELD_CONFIG,
    useValue: ['select', FormFieldSelectComponent],
    multi: true
  },
  {
    provide: FORM_FIELD_CONFIG,
    useValue: ['text', FormFieldTextComponent],
    multi: true
  },
  {
    provide: FORM_FIELD_CONFIG,
    useValue: ['textarea', FormFieldTextareaComponent],
    multi: true
  },
  {
    provide: FORM_FIELD_CONFIG,
    useValue: ['geometry', GeometryFormFieldComponent],
    multi: true
  },
  {
    provide: TOOL_LOADER,
    useFactory: toolLoader,
    deps: [TOOL_CONFIG],
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
