import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { ClientParcelElementReloadDialogComponent } from './client-parcel-element-reload-dialog.component';

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
  declarations: [ClientParcelElementReloadDialogComponent],
  exports: [ClientParcelElementReloadDialogComponent],
  entryComponents: [ClientParcelElementReloadDialogComponent]
})
export class FadqLibClientParcelElementReloadDialogModule {}
