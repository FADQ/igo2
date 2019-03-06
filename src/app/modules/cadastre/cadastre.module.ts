import { NgModule } from '@angular/core';

import { FadqMunModule } from 'src/lib/cadastre/mun/mun.module';
import { FadqCadastreSearchToolModule } from './cadastre-search-tool/cadastre-search-tool.module';

@NgModule({
  imports: [
    FadqMunModule.forRoot()
  ],
  declarations: [ ],
  exports: [
    FadqCadastreSearchToolModule
  ]
})
export class FadqCadastreModule {}
