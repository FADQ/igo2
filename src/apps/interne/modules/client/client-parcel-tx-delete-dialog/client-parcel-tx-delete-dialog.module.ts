import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule } from '@angular/material';

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
  entryComponents: [ClientParcelTxDeleteDialogComponent]
})
export class FadqClientParcelTxDeleteDialogModule {}