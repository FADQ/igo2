import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatListModule
} from '@angular/material';

import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoListModule } from '@igo2/common';

import { FadqLibClientModule } from 'src/lib/client/client.module';

import { ClientTxToolComponent } from './client-tx-tool.component';
import { ClientTxToolItemComponent } from './client-tx-tool-item.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,
    IgoLanguageModule,
    IgoListModule,
    FadqLibClientModule
  ],
  declarations: [
    ClientTxToolComponent,
    ClientTxToolItemComponent
  ],
  exports: [ClientTxToolComponent],
  entryComponents: [ClientTxToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqClientTxToolModule {}
