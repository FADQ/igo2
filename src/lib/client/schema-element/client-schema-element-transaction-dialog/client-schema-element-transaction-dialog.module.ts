import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule } from '@igo2/core';

import { ClientSchemaElementTransactionDialogComponent } from './client-schema-element-transaction-dialog.component';

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
  declarations: [ClientSchemaElementTransactionDialogComponent],
  exports: [ClientSchemaElementTransactionDialogComponent],
  entryComponents: [ClientSchemaElementTransactionDialogComponent]
})
export class FadqLibClientSchemaElementTransactionDialogModule {}
