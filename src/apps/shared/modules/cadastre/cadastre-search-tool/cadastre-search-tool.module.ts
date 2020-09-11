import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule} from '@igo2/core';

import { FadqLibCadastreModule } from 'src/lib/cadastre/cadastre.module';
import { CadastreSearchToolComponent } from './cadastre-search-tool.component';

@NgModule({
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    IgoLanguageModule,
    FadqLibCadastreModule
  ],
  declarations: [CadastreSearchToolComponent],
  entryComponents: [CadastreSearchToolComponent],
  exports: [CadastreSearchToolComponent]
})
export class FadqCadastreSearchToolModule {}
