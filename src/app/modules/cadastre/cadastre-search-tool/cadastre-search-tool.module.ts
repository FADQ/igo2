import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatButtonToggleModule
} from '@angular/material';
import { IgoLanguageModule} from '@igo2/core';
import { CadastreSearchToolComponent } from './cadastre-search-tool.component';
import { FadqCadastreMunModule } from 'src/lib/cadastre/mun/mun.module';
import { FadqCadastreCadastreModule } from 'src/lib/cadastre/cadastre/cadastre-cadastre.module';
import { FadqCadastreConcessionModule } from 'src/lib/cadastre/concession/cadastre.concession.module';
import { FadqCadastreLotModule } from 'src/lib/cadastre/lot/cadastre.lot.module';

@NgModule({
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    IgoLanguageModule,
    FadqCadastreMunModule,
    FadqCadastreCadastreModule,
    FadqCadastreConcessionModule,
    FadqCadastreLotModule],
  declarations: [CadastreSearchToolComponent],
  entryComponents: [CadastreSearchToolComponent],
  exports: [CadastreSearchToolComponent]
})
export class FadqCadastreSearchToolModule {}
