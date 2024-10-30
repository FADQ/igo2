import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientParcelElementUpdateBatchComponent } from './client-parcel-element-update-batch.component';

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
    ClientParcelElementUpdateBatchComponent
  ],
  declarations: [
    ClientParcelElementUpdateBatchComponent
  ],
})
export class FadqLibClientParcelElementUpdateBatchModule {}
