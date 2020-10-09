import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { ClientSchemaElementCommitDialogComponent } from './client-schema-element-commit-dialog.component';

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
  declarations: [ClientSchemaElementCommitDialogComponent],
  exports: [ClientSchemaElementCommitDialogComponent],
  entryComponents: [ClientSchemaElementCommitDialogComponent]
})
export class FadqLibClientSchemaElementCommitDialogModule {}
