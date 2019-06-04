import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientParcelElementCreateComponent } from './client-parcel-element-create.component';

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
    ClientParcelElementCreateComponent
  ],
  declarations: [
    ClientParcelElementCreateComponent
  ],
  entryComponents: [
    ClientParcelElementCreateComponent
  ]
})
export class FadqLibClientParcelElementCreateModule {}
