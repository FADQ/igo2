import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { ClientParcelElementTransactionComponent } from './client-parcel-element-transaction.component';

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
  declarations: [ClientParcelElementTransactionComponent],
  exports: [ClientParcelElementTransactionComponent],
  entryComponents: [ClientParcelElementTransactionComponent]
})
export class FadqLibClientParcelElementTransactionModule {}
