import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { provideConfigOptions } from '@igo2/core';
import { IgoGeometryModule, IgoQueryModule, IgoDirectionsModule, provideOsrmDirectionsSource } from '@igo2/geo';

import { environment } from 'src/environments/interne/environment';

import { FadqCoreModule } from 'src/apps/shared/modules/core/core.module';
import { FadqContextModule } from 'src/apps/shared/modules/context/context.module';
import { FadqHelpModule } from 'src/apps/shared/modules/help/help.module';
import { FadqCadastreModule } from 'src/apps/shared/modules/cadastre/cadastre.module';
import { FadqNavigationModule } from 'src/apps/shared/modules/navigation/navigation.module';
import { FadqAppOutletModule } from 'src/apps/shared/app-outlet/app-outlet.module';

import { FadqInterneAddressModule } from './modules/address/address.module';
import { FadqInterneClientModule } from './modules/client/client.module';
import { FadqInterneEditionModule } from './modules/edition/edition.module';
import { FadqInterneSearchModule } from './modules/search/search.module';
import { FadqInternePortalModule } from './views/portal/portal.module';
import { AppComponent } from './app.component';

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
    FadqInterneAddressModule,
    FadqInterneClientModule.forRoot(),
    FadqInterneSearchModule,
    FadqInterneEditionModule,
    FadqInternePortalModule
  ],
  providers: [
    provideConfigOptions({
      default: environment.igo,
      path: environment.configPath
    }),
    provideOsrmDirectionsSource()
  ],
  bootstrap: [AppComponent]
})
export class FadqInterneAppModule {}
