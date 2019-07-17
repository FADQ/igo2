import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatSlideToggleModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule, IgoEntitySelectorModule } from '@igo2/common';

import { FadqLibMessageInlineModule } from '../../../message/message-inline/message-inline.module';

import { ClientParcelElementTransferComponent } from './client-parcel-element-transfer.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    IgoLanguageModule,
    IgoFormModule,
    IgoEntitySelectorModule,
    FadqLibMessageInlineModule
  ],
  exports: [
    ClientParcelElementTransferComponent
  ],
  declarations: [
    ClientParcelElementTransferComponent
  ],
  entryComponents: [
    ClientParcelElementTransferComponent
  ]
})
export class FadqLibClientParcelElementTransferModule {}
