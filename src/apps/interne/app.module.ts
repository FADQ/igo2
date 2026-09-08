import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material/icon';
import { MatTooltipDefaultOptions, MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';

import { provideConfig } from '@igo2/core/config';
import {
  IgoGeometryModule,
  IgoQueryModule,
  IgoDirectionsModule,
  provideDirection,
  withOsrmSource} from '@igo2/geo';
import { SearchState } from '@igo2/integration';

import { environment } from '../../environments/interne/environment';

import { FadqCoreModule } from '../../apps/shared/modules/core/core.module';
import { FadqContextModule } from '../../apps/shared/modules/context/context.module';
import { FadqHelpModule } from '../../apps/shared/modules/help/help.module';
import { FadqCadastreModule } from '../../apps/shared/modules/cadastre/cadastre.module';
import { FadqNavigationModule } from '../../apps/shared/modules/navigation/navigation.module';
import { FadqAppOutletModule } from '../../apps/shared/app-outlet/app-outlet.module';

import { FadqInterneAddressModule } from './modules/address/address.module';
import { FadqInterneClientModule } from './modules/client/client.module';
import { FadqInterneEditionModule } from './modules/edition/edition.module';
import { FadqInterneSearchModule } from './modules/search/search.module';
import { FadqInternePortalModule } from './views/portal/portal.module';
import { AppComponent } from './app.component';

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

    FadqInterneAddressModule,
    FadqInterneClientModule.forRoot(),
    FadqInterneSearchModule,
    FadqInterneEditionModule,
    FadqInternePortalModule
  ],
  providers: [
    provideConfig({
      default: environment.igo,
      path: environment.configPath
    }),
    provideDirection(withOsrmSource()),
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: defaultTooltipOptions },
    DatePipe,
    SearchState,
    { provide: APP_INITIALIZER, useFactory: initializeIcons, deps: [MatIconRegistry], multi: true }
  ],
  bootstrap: [AppComponent]
})

export class FadqInterneAppModule {}

