import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import {provideLotService} from 'src/lib/cadastre/lot/shared/lot.providers';
import { FadqLotSelectorModule } from './lot-selector/cadastre-lot-selector.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    IgoLanguageModule
  ],
  declarations: [],
  exports: [FadqLotSelectorModule]
})
export class FadqCadastreLotModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqCadastreLotModule,
      providers: [
        provideLotService()
      ]
    };
  }
}
