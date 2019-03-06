import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { MunSelectorComponent } from './mun-selector.component';

import {provideMunService} from 'src/lib/cadastre/mun/shared/mun.providers';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    IgoLanguageModule
  ],
  declarations: [MunSelectorComponent],
  exports: [MunSelectorComponent]
})
export class FadqMunSelectorModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqMunSelectorModule,
      providers: [
        provideMunService()
      ]
    };
  }
}
