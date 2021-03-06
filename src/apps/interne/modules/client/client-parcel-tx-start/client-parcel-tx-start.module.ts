import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule } from '@igo2/core';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';
import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { ClientParcelTxStartComponent } from './client-parcel-tx-start.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    FadqLibCardPanelModule,
    FadqLibMessageInlineModule
  ],
  exports: [
    ClientParcelTxStartComponent
  ],
  declarations: [
    ClientParcelTxStartComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqClientParcelTxStartModule {}
