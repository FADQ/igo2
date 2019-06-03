import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatFormFieldModule, MatInputModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { ClientSchemaParcelTransferComponent } from './client-schema-parcel-transfer.component';

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
    ClientSchemaParcelTransferComponent
  ],
  declarations: [
    ClientSchemaParcelTransferComponent
  ],
  entryComponents: [
    ClientSchemaParcelTransferComponent
  ]
})
export class FadqLibClientSchemaParcelTransferModule {}
