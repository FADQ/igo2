import { NgModule } from '@angular/core';
import { CadastreSearchToolComponent } from 'src/app/modules/cadastre/cadastre-search-tool/cadastre-search-tool.component';
import { FadqMunSelectorModule } from 'src/lib/cadastre/mun/mun-selector/mun-selector.module';

@NgModule({
  imports: [FadqMunSelectorModule],
  declarations: [CadastreSearchToolComponent],
  entryComponents: [CadastreSearchToolComponent],
  exports: [CadastreSearchToolComponent]
})
export class FadqCadastreSearchToolModule {}
