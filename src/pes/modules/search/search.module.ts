import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSearchModule } from '@igo2/geo';

import { provideCoordinatesReverseSearchSource } from './shared/sources/coordinates.providers';
import {
  provideFadqIChercheSearchResultFormatter,
  provideIChercheSearchSource,
  provideIChercheReverseSearchSource
} from './shared/sources/icherche.providers';
import { provideQuerySearchSource } from './shared/sources/query.providers';


@NgModule({
  imports: [
    IgoSearchModule.forRoot()
  ],
  exports: [
    IgoSearchModule
  ],
  declarations: []
})
export class FadqSearchModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqSearchModule,
      providers: [
        provideFadqIChercheSearchResultFormatter(),
        provideIChercheSearchSource(),
        provideIChercheReverseSearchSource(),
        provideCoordinatesReverseSearchSource(),
        provideQuerySearchSource()
      ]
    };
  }
}
