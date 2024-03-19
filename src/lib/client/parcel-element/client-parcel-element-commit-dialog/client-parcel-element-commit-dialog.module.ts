import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { IgoLanguageModule } from '@igo2/core';

import { ClientParcelElementCommitDialogComponent } from './client-parcel-element-commit-dialog.component';

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
  declarations: [ClientParcelElementCommitDialogComponent],
  exports: [ClientParcelElementCommitDialogComponent],
})
export class FadqLibClientParcelElementCommitDialogModule {}
