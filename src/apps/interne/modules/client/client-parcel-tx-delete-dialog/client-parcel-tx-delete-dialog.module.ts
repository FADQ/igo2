import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { IgoLanguageModule } from '@igo2/core';

import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { ClientParcelTxDeleteDialogComponent } from './client-parcel-tx-delete-dialog.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    IgoLanguageModule,
    FadqLibMessageInlineModule
  ],
  declarations: [ClientParcelTxDeleteDialogComponent],
  exports: [ClientParcelTxDeleteDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqClientParcelTxDeleteDialogModule {}
