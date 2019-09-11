import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { ClientParcelElementDeleteTxDialogComponent } from './client-parcel-element-delete-tx-dialog.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    IgoLanguageModule
  ],
  declarations: [ClientParcelElementDeleteTxDialogComponent],
  exports: [ClientParcelElementDeleteTxDialogComponent],
  entryComponents: [ClientParcelElementDeleteTxDialogComponent]
})
export class FadqLibClientParcelElementDeleteTxDialogModule {}
