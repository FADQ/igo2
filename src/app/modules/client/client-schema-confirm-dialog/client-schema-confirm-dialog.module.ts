import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientSchemaConfirmDialogComponent } from './client-schema-confirm-dialog.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ClientSchemaConfirmDialogComponent],
  exports: [ClientSchemaConfirmDialogComponent]
})
export class FadqClientSchemaConfirmDialogModule {}
