import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientParcelElementFillComponent } from './client-parcel-element-fill.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoFeatureFormModule,
    FadqLibEditionModule
  ],
  exports: [
    ClientParcelElementFillComponent
  ],
  declarations: [
    ClientParcelElementFillComponent
  ],
  entryComponents: [
    ClientParcelElementFillComponent
  ]
})
export class FadqLibClientParcelElementFillModule {}
