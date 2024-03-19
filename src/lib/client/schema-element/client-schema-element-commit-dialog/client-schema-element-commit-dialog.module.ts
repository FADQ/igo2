import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

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
})
export class FadqLibClientSchemaElementCommitDialogModule {}
