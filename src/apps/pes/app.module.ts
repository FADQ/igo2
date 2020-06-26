import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { provideConfigOptions } from '@igo2/core';
import { IgoGeometryModule, IgoQueryModule } from '@igo2/geo';
import { IgoIntegrationModule } from '@igo2/integration';

import { environment } from 'src/environments/pes/environment';

import { FadqCoreModule } from 'src/apps/shared/modules/core/core.module';
import { FadqHelpModule } from 'src/apps/shared/modules/help/help.module';
import { FadqCadastreModule } from 'src/apps/shared/modules/cadastre/cadastre.module';
import { FadqNavigationModule } from 'src/apps/shared/modules/navigation/navigation.module';
import { FadqAppOutletModule } from 'src/apps/shared/app-outlet/app-outlet.module';

import { FadqPesClientModule } from './modules/client/client.module';
import { FadqPesSearchModule } from './modules/search/search.module';
import { FadqPesPortalModule } from './views/portal/portal.module';
import { AppComponent } from './app.component';

import { ClientLoader } from './modules/client/shared/client.loader';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([]),
    IgoGeometryModule,
    IgoQueryModule.forRoot(),
    IgoIntegrationModule,
    FadqCoreModule,
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
    ClientLoader
  ],
  bootstrap: [AppComponent]
})
export class FadqPesAppModule {}
