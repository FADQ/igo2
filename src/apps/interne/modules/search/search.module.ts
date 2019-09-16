import { NgModule } from '@angular/core';

import { FadqSearchModule } from 'src/apps/shared/modules/search/search.module';
import {
  provideCoordinatesReverseSearchSource,
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
    provideClientSearchSource(),
    provideFadqIChercheSearchResultFormatter(),
    provideIChercheSearchSource(),
    provideIChercheReverseSearchSource(),
    provideCoordinatesReverseSearchSource(),
    provideQuerySearchSource()
  ]
})
export class FadqInterneSearchModule {}
