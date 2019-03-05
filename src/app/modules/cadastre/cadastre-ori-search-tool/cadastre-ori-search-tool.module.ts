import { NgModule } from '@angular/core';
import { CadastreOriSearchToolComponent } from 'src/app/modules/cadastre/cadastre-ori-search-tool/cadastre-ori-search-tool.component';
import {FadqMunSelectorModule} from 'src/lib/cadastre/mun/mun-selector/mun-selector.module';

@NgModule({
  imports: [FadqMunSelectorModule],
  declarations: [CadastreOriSearchToolComponent],
  entryComponents: [CadastreOriSearchToolComponent],
  exports: [CadastreOriSearchToolComponent]
})
export class FadqCadastreOriSearchToolModule {}
