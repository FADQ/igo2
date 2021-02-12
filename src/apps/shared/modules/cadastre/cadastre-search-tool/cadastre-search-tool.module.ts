import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ToolService } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

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
  exports: [CadastreSearchToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqCadastreSearchToolModule {}

ToolService.register({
  name: 'cadastre',
  title: 'tools.cadastre',
  icon: 'view-quilt',
  component: CadastreSearchToolComponent
});
