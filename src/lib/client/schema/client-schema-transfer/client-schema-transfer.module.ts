import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { ClientSchemaTransferComponent } from './client-schema-transfer.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule
  ],
  exports: [
    ClientSchemaTransferComponent
  ],
  declarations: [
    ClientSchemaTransferComponent
  ],
  entryComponents: [
    ClientSchemaTransferComponent
  ]
})
export class FadqLibClientSchemaTransferModule {}
