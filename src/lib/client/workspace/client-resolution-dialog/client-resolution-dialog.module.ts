import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { ClientResolutionDialogComponent } from './client-resolution-dialog.component';

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
  declarations: [ClientResolutionDialogComponent],
  exports: [ClientResolutionDialogComponent],
  entryComponents: [ClientResolutionDialogComponent]
})
export class FadqLibClientResolutionDialogModule {}
