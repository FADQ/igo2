import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

import { IgoLanguageModule } from '@igo2/core/language';
import { IgoFeatureFormModule } from '@igo2/geo';
import {
  FormFieldComponent,
  FormGroupComponent
} from '@igo2/common/form';

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
    ReactiveFormsModule,

    IgoLanguageModule,
    IgoFeatureFormModule,
    FadqLibMessageInlineModule,

    FormFieldComponent,
    FormGroupComponent

  ],
  exports: [
    EditionUpsertComponent
  ],
  declarations: [
    EditionUpsertComponent
  ],
})
export class FadqLibEditionUpsertModule {}
