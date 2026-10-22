import { NgModule } from '@angular/core';

import { 
  provideCoordinatesReverseSearchSource,
  provideIChercheSearchSource,
  provideIChercheReverseSearchSource,
  provideDefaultIChercheSearchResultFormatter,
  provideQuerySearchSource
 } from '@igo2/geo';

@NgModule({
  declarations: [],
  providers: [
    provideDefaultIChercheSearchResultFormatter(),
    provideIChercheSearchSource(),
    provideIChercheReverseSearchSource(),
    provideCoordinatesReverseSearchSource(),
    provideQuerySearchSource()
  ]
})
export class FadqPesSearchModule {}
