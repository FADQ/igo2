import { NgModule, ModuleWithProviders } from '@angular/core';

import { FadqLibSearchModule } from 'src/lib/search/search.module';

import { FadqSearchResultsToolModule } from './search-results-tool/search-results-tool.module';
import { provideClientSearchSource } from './shared/sources/client.providers';
import { provideMapSearchSource } from './shared/sources/map.providers';
import {
  provideFadqIChercheSearchResultFormatter
} from './shared/sources/icherche';

import { SearchState } from './search.state';

@NgModule({
  imports: [
    FadqLibSearchModule.forRoot(),
    FadqSearchResultsToolModule
  ],
  exports: [
    FadqLibSearchModule
  ],
  declarations: []
})
export class FadqSearchModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqSearchModule,
      providers: [
        SearchState,
        provideFadqIChercheSearchResultFormatter(),
        provideClientSearchSource(),
        provideMapSearchSource()
      ]
    };
  }
}
