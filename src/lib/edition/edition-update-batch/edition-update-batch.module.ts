import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatTabsModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { EditionUpdateBatchComponent } from './edition-update-batch.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatTabsModule,
    IgoLanguageModule,
    IgoFeatureFormModule,
    FadqLibMessageInlineModule
  ],
  exports: [
    EditionUpdateBatchComponent
  ],
  declarations: [
    EditionUpdateBatchComponent
  ],
  entryComponents: [
    EditionUpdateBatchComponent
  ]
})
export class FadqLibEditionUpdateBatchModule {}
