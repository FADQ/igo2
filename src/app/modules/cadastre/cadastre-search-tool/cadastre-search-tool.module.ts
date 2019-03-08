import { NgModule } from '@angular/core';
import { CadastreSearchToolComponent } from 'src/app/modules/cadastre/cadastre-search-tool/cadastre-search-tool.component';
import { FadqMunModule } from 'src/lib/cadastre/mun/mun.module';
import {FadqCadastreCadastreModule} from '../../../../lib/cadastre/cadastre/cadastre.cadastre.module';

@NgModule({
  imports: [FadqMunModule, FadqCadastreCadastreModule],
  declarations: [CadastreSearchToolComponent],
  entryComponents: [CadastreSearchToolComponent],
  exports: [CadastreSearchToolComponent]
})
export class FadqCadastreSearchToolModule {}
