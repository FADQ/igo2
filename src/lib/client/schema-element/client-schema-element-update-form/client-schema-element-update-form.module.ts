import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatTabsModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';


import {
  ClientSchemaElementUpdateFormComponent
} from './client-schema-element-update-form.component';

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
    ClientSchemaElementUpdateFormComponent
  ],
  declarations: [
    ClientSchemaElementUpdateFormComponent
  ],
  entryComponents: [
    ClientSchemaElementUpdateFormComponent
  ]
})
export class FadqLibClientSchemaElementUpdateFormModule {}
