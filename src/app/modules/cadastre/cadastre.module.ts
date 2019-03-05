import { NgModule } from '@angular/core';

import {FadqMunSelectorModule} from 'src/lib/cadastre/mun/mun-selector/mun-selector.module';
import {FadqCadastreOriSearchToolModule} from './cadastre-ori-search-tool/cadastre-ori-search-tool.module';



@NgModule({
  imports: [
    FadqMunSelectorModule.forRoot()
  ],
  declarations: [ ],
  exports: [
    FadqCadastreOriSearchToolModule
  ]
})
export class FadqCadastreModule {}
