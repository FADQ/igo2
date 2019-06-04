import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientParcelElementSliceComponent } from './client-parcel-element-slice.component';

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
    ClientParcelElementSliceComponent
  ],
  declarations: [
    ClientParcelElementSliceComponent
  ],
  entryComponents: [
    ClientParcelElementSliceComponent
  ]
})
export class FadqLibClientParcelElementSliceModule {}
