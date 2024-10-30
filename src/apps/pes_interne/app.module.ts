import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipDefaultOptions, MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';

import { provideConfigOptions } from '@igo2/core';
import { IgoGeometryModule, IgoQueryModule, IgoDirectionsModule, provideOsrmDirectionsSource } from '@igo2/geo';

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

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([]),
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
    provideConfigOptions({
      default: environment.igo,
      path: environment.configPath
    }),
    {
      provide: ClientLoader,
      useClass: URLClientLoader
      // deps: [ClientService]
    },
    provideOsrmDirectionsSource(),
    DatePipe,
  ],
  bootstrap: [AppComponent]
})
export class FadqPesInterneAppModule {}
