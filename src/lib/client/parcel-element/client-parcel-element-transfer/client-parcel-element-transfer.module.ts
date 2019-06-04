import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatFormFieldModule, MatInputModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { ClientParcelElementTransferComponent } from './client-parcel-element-transfer.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    IgoLanguageModule,
    IgoFormModule
  ],
  exports: [
    ClientParcelElementTransferComponent
  ],
  declarations: [
    ClientParcelElementTransferComponent
  ],
  entryComponents: [
    ClientParcelElementTransferComponent
  ]
})
export class FadqLibClientParcelElementTransferModule {}
