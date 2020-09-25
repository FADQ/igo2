import { NgModule } from '@angular/core';

import { FadqSearchModule } from 'src/apps/shared/modules/search/search.module';
import {
  provideCoordinatesReverseSearchSource,
  provideFadqIChercheSearchResultFormatter,
  provideIChercheSearchSource,
  provideIChercheReverseSearchSource,
  provideQuerySearchSource
} from 'src/apps/shared/modules/search/shared/sources';

@NgModule({
  imports: [
    FadqSearchModule
  ],
  exports: [
    FadqSearchModule
  ],
  declarations: [],
  providers: [
    provideFadqIChercheSearchResultFormatter(),
    provideIChercheSearchSource(),
    provideIChercheReverseSearchSource(),
    provideCoordinatesReverseSearchSource(),
    provideQuerySearchSource()
  ]
})
export class FadqProtoSearchModule {}
