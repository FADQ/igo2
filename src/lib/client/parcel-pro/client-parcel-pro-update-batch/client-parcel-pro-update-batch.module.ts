import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientParcelProUpdateBatchComponent } from './client-parcel-pro-update-batch.component';

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
    ClientParcelProUpdateBatchComponent
  ],
  declarations: [
    ClientParcelProUpdateBatchComponent
  ],
  entryComponents: [
    ClientParcelProUpdateBatchComponent
  ]
})
export class FadqLibClientParcelProUpdateBatchModule {}
