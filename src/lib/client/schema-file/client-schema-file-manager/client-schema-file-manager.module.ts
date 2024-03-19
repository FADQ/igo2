import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule } from '@igo2/common';

import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { ClientSchemaFileManagerComponent } from './client-schema-file-manager.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    IgoLanguageModule,
    IgoEntityTableModule,
    FadqLibMessageInlineModule
  ],
  exports: [
    ClientSchemaFileManagerComponent
  ],
  declarations: [
    ClientSchemaFileManagerComponent
  ],
})
export class FadqLibClientSchemaFileManagerModule {}
