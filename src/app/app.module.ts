import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material';

import { IgoSpinnerModule, IgoStopPropagationModule } from '@igo2/common';
import { IgoGeometryModule, IgoQueryModule } from '@igo2/geo';
import { IgoIntegrationModule } from '@igo2/integration';

import { FadqCoreModule } from './modules/core/core.module';
import { FadqHelpModule } from './modules/help/help.module';
import { FadqAddressModule } from './modules/address/address.module';
import { FadqCadastreModule } from './modules/cadastre/cadastre.module';
import { FadqClientModule } from './modules/client/client.module';
import { FadqNavigationModule } from './modules/navigation/navigation.module';
import { FadqSearchModule } from './modules/search/search.module';
import { FadqLibEditionModule } from 'src/lib/edition/edition.module';
import { FadqPortalModule } from './pages/portal/portal.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([]),
    IgoSpinnerModule,
    IgoStopPropagationModule,
    IgoGeometryModule,
    IgoQueryModule.forRoot(),
    IgoIntegrationModule,
    FadqCoreModule,
    FadqHelpModule,
    FadqAddressModule,
    FadqCadastreModule,
    FadqClientModule,
    FadqNavigationModule,
    FadqSearchModule.forRoot(),
    FadqLibEditionModule.forRoot(),
    FadqPortalModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer){
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
