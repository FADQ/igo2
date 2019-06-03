import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { ClientSchemaElementTransactionComponent } from './client-schema-element-transaction.component';

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
  declarations: [ClientSchemaElementTransactionComponent],
  exports: [ClientSchemaElementTransactionComponent],
  entryComponents: [ClientSchemaElementTransactionComponent]
})
export class FadqLibClientSchemaElementTransactionModule {}
