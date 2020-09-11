import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { ClientSchemaTransferComponent } from './client-schema-transfer.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule,
    FadqLibMessageInlineModule
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
