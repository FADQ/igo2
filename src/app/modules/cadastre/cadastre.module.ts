import { NgModule } from '@angular/core';

import { FadqMunModule } from 'src/lib/cadastre/mun/mun.module';
import { FadqCadastreSearchToolModule } from './cadastre-search-tool/cadastre-search-tool.module';
import { FadqCadastreCadastreModule } from 'src/lib/cadastre/cadastre/cadastre.cadastre.module';
import { FadqCadastreConcessionModule } from 'src/lib/cadastre/concession/cadastre.concession.module';
import { FadqCadastreLotModule } from 'src/lib/cadastre/lot/cadastre.lot.module';

@NgModule({
  imports: [
    FadqMunModule.forRoot(),
    FadqCadastreCadastreModule.forRoot(),
    FadqCadastreConcessionModule.forRoot(),
    FadqCadastreLotModule.forRoot(),
  ],
  declarations: [ ],
  exports: [
    FadqCadastreSearchToolModule
  ]
})
export class FadqCadastreModule {}
