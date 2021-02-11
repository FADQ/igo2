import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

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
