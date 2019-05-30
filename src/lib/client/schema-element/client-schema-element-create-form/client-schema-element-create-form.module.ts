import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatTabsModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import {
  ClientSchemaElementCreateFormComponent
} from './client-schema-element-create-form.component';

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
    FadqLibEditionModule
  ],
  exports: [
    ClientSchemaElementCreateFormComponent
  ],
  declarations: [
    ClientSchemaElementCreateFormComponent
  ],
  entryComponents: [
    ClientSchemaElementCreateFormComponent
  ]
})
export class FadqLibClientSchemaElementCreateFormModule {}
