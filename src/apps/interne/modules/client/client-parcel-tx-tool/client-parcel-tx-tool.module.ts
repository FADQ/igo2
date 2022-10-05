import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoListModule } from '@igo2/common';

import { FadqLibClientModule } from 'src/lib/client/client.module';
import { TOOL_CONFIG } from 'src/lib/core/core.module';

import { ClientParcelTxToolComponent } from './client-parcel-tx-tool.component';
import { ClientParcelTxToolItemComponent } from './client-parcel-tx-tool-item.component';

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
    ClientParcelTxToolComponent,
    ClientParcelTxToolItemComponent
  ],
  exports: [ClientParcelTxToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: TOOL_CONFIG,
      useValue: {
        name: 'clientTx',
        title: 'tools.clientParcelTx',
        icon: 'account-multiple-plus',
        component: ClientParcelTxToolComponent
      },
      multi: true
    },
  ]
})
export class FadqClientParcelTxToolModule {}
