import { NgModule } from '@angular/core';
import { 
  provideSearchSourceService,
  provideCoordinatesReverseSearchSource,
  provideDefaultCoordinatesSearchResultFormatter,
  provideIChercheSearchSource,
  provideIChercheReverseSearchSource,
  provideDefaultIChercheSearchResultFormatter,
  provideQuerySearchSource } from '@igo2/geo';

import { provideCadastreRenoSearchSource } from 'src/lib/cadastre-reno';

import { provideClientSearchSource } from './shared/sources/client.providers';

@NgModule({
  declarations: [],
  providers: [
    provideSearchSourceService(),
    provideClientSearchSource(),
    provideDefaultIChercheSearchResultFormatter(),
    provideIChercheSearchSource(),
    provideIChercheReverseSearchSource(),
    provideDefaultCoordinatesSearchResultFormatter(),
    provideCoordinatesReverseSearchSource(),
    provideQuerySearchSource(),
    provideCadastreRenoSearchSource()
  ]
})
export class FadqInterneSearchModule {}
