import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientParcelElementSimplifyComponent } from './client-parcel-element-simplify.component';

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
    ClientParcelElementSimplifyComponent
  ],
  declarations: [
    ClientParcelElementSimplifyComponent
  ],
  entryComponents: [
    ClientParcelElementSimplifyComponent
  ]
})
export class FadqLibClientParcelElementSimplifyModule {}
