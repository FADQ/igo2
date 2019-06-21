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

import { ClientListToolComponent } from './client-list-tool.component';
import { ClientListToolItemComponent } from './client-list-tool-item.component';

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
    ClientListToolComponent,
    ClientListToolItemComponent
  ],
  exports: [ClientListToolComponent],
  entryComponents: [ClientListToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqClientListToolModule {}
