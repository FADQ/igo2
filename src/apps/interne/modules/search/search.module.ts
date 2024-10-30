import { NgModule } from '@angular/core';
import { provideSearchSourceService } from '@igo2/geo';

import { provideCadastreRenoSearchSource } from 'src/lib/cadastre-reno';

import { FadqSearchModule } from 'src/apps/shared/modules/search/search.module';
import {
  provideCoordinatesReverseSearchSource,
  provideCoordinatesSearchResultFormatter,
  provideFadqIChercheSearchResultFormatter,
  provideIChercheSearchSource,
  provideIChercheReverseSearchSource,
  provideQuerySearchSource
} from 'src/apps/shared/modules/search/shared/sources';

import { provideClientSearchSource } from './shared/sources/client.providers';

@NgModule({
  imports: [
    FadqSearchModule
  ],
  exports: [
    FadqSearchModule
  ],
  declarations: [],
  providers: [
    provideSearchSourceService(),
    provideClientSearchSource(),
    provideFadqIChercheSearchResultFormatter(),
    provideIChercheSearchSource(),
    provideIChercheReverseSearchSource(),
    provideCoordinatesSearchResultFormatter(),
    provideCoordinatesReverseSearchSource(),
    provideQuerySearchSource(),
    provideCadastreRenoSearchSource()
  ]
})
export class FadqInterneSearchModule {}
