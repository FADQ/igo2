import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import {provideCadastreService} from 'src/lib/cadastre/cadastre/shared/cadastre.providers';
import { FadqCadastreSelectorModule } from './cadastre-selector/cadastre-cadastre-selector.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    IgoLanguageModule
  ],
  declarations: [],
  exports: [FadqCadastreSelectorModule]
})
export class FadqCadastreCadastreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqCadastreCadastreModule,
      providers: [
        provideCadastreService()
      ]
    };
  }
}
