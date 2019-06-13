import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule, IgoFormModule } from '@igo2/common';

import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { EditionSaveComponent } from './edition-save.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule,
    IgoEntityTableModule,
    FadqLibMessageInlineModule
  ],
  exports: [
    EditionSaveComponent
  ],
  declarations: [
    EditionSaveComponent
  ],
  entryComponents: [
    EditionSaveComponent
  ]
})
export class FadqLibEditionSaveModule {}
