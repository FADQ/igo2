import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { IgoLanguageModule } from '@igo2/core';

import { AddressEditorSaveDialogComponent } from './address-editor-save-dialog.component';

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
  declarations: [AddressEditorSaveDialogComponent],
  exports: [AddressEditorSaveDialogComponent],
})
export class FadqAddressEditorSaveDialogModule {}
