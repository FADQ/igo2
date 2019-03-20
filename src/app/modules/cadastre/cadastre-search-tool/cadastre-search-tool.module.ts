import { NgModule } from '@angular/core';
import { CadastreSearchToolComponent } from 'src/app/modules/cadastre/cadastre-search-tool/cadastre-search-tool.component';
import { FadqMunModule } from 'src/lib/cadastre/mun/mun.module';
import {FadqCadastreCadastreModule} from '../../../../lib/cadastre/cadastre/cadastre.cadastre.module';
import { FadqCadastreConcessionModule } from 'src/lib/cadastre/concession/cadastre.concession.module';

@NgModule({
  imports: [
    FadqMunModule,
    FadqCadastreCadastreModule,
    FadqCadastreConcessionModule],
  declarations: [CadastreSearchToolComponent],
  entryComponents: [CadastreSearchToolComponent],
  exports: [CadastreSearchToolComponent]
})
export class FadqCadastreSearchToolModule {}
