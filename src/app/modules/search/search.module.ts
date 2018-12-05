import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { provideSearchSourceService } from './shared/search-source.service';
import {
  provideIChercheSearchSource,
  provideIChercheReverseSearchSource
} from './shared/sources/icherche.providers';
import { provideNominatimSearchSource } from './shared/sources/nominatim.providers';
import { provideILayerSearchSource } from './shared/sources/ilayer.providers';
import { provideClientSearchSource } from './shared/sources/client.providers';

import { FadqSearchBarModule } from './search-bar/search-bar.module';
import { FadqSearchSelectorModule } from './search-selector/search-selector.module';
import { FadqSearchResultsModule } from './search-results/search-results.module';

@NgModule({
  imports: [
    CommonModule,
    FadqSearchBarModule,
    FadqSearchSelectorModule,
    FadqSearchResultsModule
  ],
  exports: [
    FadqSearchBarModule,
    FadqSearchSelectorModule,
    FadqSearchResultsModule
  ],
  declarations: []
})
export class FadqSearchModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqSearchModule,
      providers:  [
        provideSearchSourceService(),
        provideIChercheSearchSource(),
        provideIChercheReverseSearchSource(),
        provideNominatimSearchSource(),
        // provideILayerSearchSource(),
        provideClientSearchSource()
      ]
    };
  }
}
