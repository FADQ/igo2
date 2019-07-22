import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatTabsModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { EditionUpsertComponent } from './edition-upsert.component';

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
    EditionUpsertComponent
  ],
  declarations: [
    EditionUpsertComponent
  ],
  entryComponents: [
    EditionUpsertComponent
  ]
})
export class FadqLibEditionUpsertModule {}
