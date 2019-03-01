import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CadastreOriSearchToolComponent } from './cadastreOri-search-tool.component';
import {FadqMunSelectorModule} from '../../mun/mun-selector/mun-selector.module';

@NgModule({
  imports: [FadqMunSelectorModule],
  declarations: [CadastreOriSearchToolComponent],
  entryComponents: [CadastreOriSearchToolComponent],
  exports: [CadastreOriSearchToolComponent]
})
export class FadqCadastreOriSearchToolModule {}
