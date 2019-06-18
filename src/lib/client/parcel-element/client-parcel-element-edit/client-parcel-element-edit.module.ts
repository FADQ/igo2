import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { ClientParcelElementEditComponent } from './client-parcel-element-edit.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule,
    FadqLibMessageInlineModule
  ],
  exports: [
    ClientParcelElementEditComponent
  ],
  declarations: [
    ClientParcelElementEditComponent
  ],
  entryComponents: [
    ClientParcelElementEditComponent
  ]
})
export class FadqLibClientParcelElementEditModule {}
