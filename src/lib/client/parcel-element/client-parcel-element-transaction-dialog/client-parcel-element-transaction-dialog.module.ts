import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule } from '@igo2/core';

import { ClientParcelElementTransactionDialogComponent } from './client-parcel-element-transaction-dialog.component';

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
  declarations: [ClientParcelElementTransactionDialogComponent],
  exports: [ClientParcelElementTransactionDialogComponent],
  entryComponents: [ClientParcelElementTransactionDialogComponent]
})
export class FadqLibClientParcelElementTransactionDialogModule {}
