import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule } from '@igo2/common';

import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { ClientParcelElementReconciliateComponent } from './client-parcel-element-reconciliate.component';

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
    IgoEntityTableModule,
    FadqLibMessageInlineModule
  ],
  exports: [
    ClientParcelElementReconciliateComponent
  ],
  declarations: [
    ClientParcelElementReconciliateComponent
  ],
  entryComponents: [
    ClientParcelElementReconciliateComponent
  ]
})
export class FadqLibClientParcelElementReconciliateModule {}
