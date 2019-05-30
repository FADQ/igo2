import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import {
  ClientSchemaElementSliceFormComponent
} from './client-schema-element-slice-form.component';

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
    IgoFeatureFormModule,
    FadqLibEditionModule
  ],
  exports: [
    ClientSchemaElementSliceFormComponent
  ],
  declarations: [
    ClientSchemaElementSliceFormComponent
  ],
  entryComponents: [
    ClientSchemaElementSliceFormComponent
  ]
})
export class FadqLibClientSchemaElementSliceFormModule {}
