import { NgModule } from '@angular/core';

import { FadqMunSelectorModule } from 'src/lib/cadastre/mun/mun-selector/mun-selector.module';
import { FadqCadastreSearchToolModule } from './cadastre-search-tool/cadastre-search-tool.module';

@NgModule({
  imports: [
    FadqMunSelectorModule.forRoot()
  ],
  declarations: [ ],
  exports: [
    FadqCadastreSearchToolModule
  ]
})
export class FadqCadastreModule {}
