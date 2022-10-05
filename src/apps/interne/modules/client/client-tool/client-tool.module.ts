import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoListModule, IgoCollapsibleModule } from '@igo2/common';

import { FadqLibClientModule } from 'src/lib/client/client.module';
import { TOOL_CONFIG } from 'src/lib/core/core.module';
import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { ClientToolComponent } from './client-tool.component';
import { ClientToolItemComponent } from './client-tool-item.component';

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
    IgoCollapsibleModule,
    FadqLibClientModule,
    FadqLibMessageInlineModule
  ],
  declarations: [
    ClientToolComponent,
    ClientToolItemComponent
  ],
  exports: [ClientToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: TOOL_CONFIG,
      useValue: {
        name: 'client',
        title: 'tools.client',
        icon: 'account',
        component: ClientToolComponent
      },
      multi: true
    },
  ]
})
export class FadqClientToolModule {}
