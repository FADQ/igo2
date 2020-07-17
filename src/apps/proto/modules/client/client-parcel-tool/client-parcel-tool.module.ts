import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { FadqLibClientParcelProModule } from 'src/lib/client/parcel-pro/client-parcel-pro.module';
import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { ClientParcelToolComponent } from './client-parcel-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    FadqLibClientParcelProModule,
    FadqLibMessageInlineModule
  ],
  declarations: [
    ClientParcelToolComponent
  ],
  exports: [ClientParcelToolComponent],
  entryComponents: [ClientParcelToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqClientParcelToolModule {}
