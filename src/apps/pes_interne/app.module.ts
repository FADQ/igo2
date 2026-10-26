import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material/icon';
import { MatTooltipDefaultOptions, MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';

import { provideIcon } from '@igo2/common/icon';
import { provideConfig } from '@igo2/core/config';
import {
  IgoGeometryModule,
  IgoQueryModule,
  IgoDirectionsModule,
  provideDirection,
  withOsrmSource} from '@igo2/geo';
import { SearchState } from '@igo2/integration';

import { contextUriFixInterceptor } from 'src/lib/context/shared/context-uri.interceptor'
import { environment } from 'src/environments/pes_interne/environment';

import { FadqCoreModule } from 'src/apps/shared/modules/core/core.module';
import { FadqContextModule } from 'src/apps/shared/modules/context/context.module';
import { FadqHelpModule } from 'src/apps/shared/modules/help/help.module';
import { FadqCadastreModule } from 'src/apps/shared/modules/cadastre/cadastre.module';
import { FadqNavigationModule } from 'src/apps/shared/modules/navigation/navigation.module';
import { FadqAppOutletModule } from 'src/apps/shared/app-outlet/app-outlet.module';

import { FadqPesClientModule } from 'src/apps/pes/modules/client/client.module';
import { FadqPesSearchModule } from 'src/apps/pes/modules/search/search.module';
import { FadqPesPortalModule } from 'src/apps/pes/views/portal/portal.module';
import { AppComponent } from './app.component';

import { ClientLoader } from 'src/apps/pes/modules/client/shared/client.loader';
import { URLClientLoader } from './modules/client/shared/client.loader';

export const defaultTooltipOptions: MatTooltipDefaultOptions = {
  showDelay: 3000,
  hideDelay: 0,
  touchendHideDelay: 0,
  disableTooltipInteractivity: true
};

export function initializeIcons(
  iconRegistry: MatIconRegistry
) {
  return () => {
    iconRegistry.setDefaultFontSetClass(
      'material-symbols-outlined'
    );
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([]),

    // IGO modules (fournissent les états automatiquement)
    IgoGeometryModule,
    IgoQueryModule.forRoot(),
    IgoDirectionsModule,

    FadqCoreModule,
    FadqContextModule,
    FadqHelpModule,
    FadqCadastreModule,
    FadqNavigationModule,
    FadqAppOutletModule,
    FadqPesClientModule,
    FadqPesSearchModule,
    FadqPesPortalModule
  ],
  providers: [
    provideConfig({
      default: environment.igo,
      path: environment.configPath
    }),
    provideHttpClient(
      withInterceptors([contextUriFixInterceptor]),
      withInterceptorsFromDi()
    ),
    provideDirection(withOsrmSource()),
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: defaultTooltipOptions },
    DatePipe,
    {
      provide: ClientLoader,
      useClass: URLClientLoader
      // deps: [ClientService]
    },
    SearchState,
    provideIcon()
  ],
  bootstrap: [AppComponent]
})
export class FadqPesInterneAppModule {}
