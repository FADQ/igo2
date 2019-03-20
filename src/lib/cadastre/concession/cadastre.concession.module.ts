import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import {provideConcessionService} from 'src/lib/cadastre/concession/shared/concession.providers';
import { FadqConcessionSelectorModule } from './concession-selector/cadastre-concession-selector.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    IgoLanguageModule
  ],
  declarations: [],
  exports: [FadqConcessionSelectorModule]
})
export class FadqCadastreConcessionModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqCadastreConcessionModule,
      providers: [
        provideConcessionService()
      ]
    };
  }
}
