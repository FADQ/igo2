import { NgModule } from '@angular/core';

import { FadqMunModule } from 'src/lib/cadastre/mun/mun.module';
import { FadqCadastreSearchToolModule } from './cadastre-search-tool/cadastre-search-tool.module';
import { FadqCadastreCadastreModule } from 'src/lib/cadastre/cadastre/cadastre.cadastre.module';

@NgModule({
  imports: [
    FadqMunModule.forRoot(),
    FadqCadastreCadastreModule.forRoot()
  ],
  declarations: [ ],
  exports: [
    FadqCadastreSearchToolModule
  ]
})
export class FadqCadastreModule {}
