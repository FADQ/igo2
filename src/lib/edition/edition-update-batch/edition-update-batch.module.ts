import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

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
})
export class FadqLibEditionUpdateBatchModule {}
