import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatListModule
} from '@angular/material';

import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoListModule, IgoCollapsibleModule } from '@igo2/common';

import { FadqLibClientModule } from 'src/lib/client/client.module';

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
    FadqLibClientModule
  ],
  declarations: [
    ClientToolComponent,
    ClientToolItemComponent
  ],
  exports: [ClientToolComponent],
  entryComponents: [ClientToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqClientToolModule {}
