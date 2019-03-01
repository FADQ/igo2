import { NgModule } from '@angular/core';
import {FadqMunSelectorModule} from '../mun/mun-selector/mun-selector.module';
import {CadastreOriSearchToolComponent} from './cadastreOri-search-tool/cadastreOri-search-tool.component';
import {FadqCadastreOriSearchToolModule} from './cadastreOri-search-tool/cadastreOri-search-tool.module';


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
