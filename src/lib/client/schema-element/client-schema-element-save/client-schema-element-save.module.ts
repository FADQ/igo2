import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientSchemaElementSaveComponent } from './client-schema-element-save.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoFeatureFormModule,
    FadqLibEditionModule
  ],
  exports: [
    ClientSchemaElementSaveComponent
  ],
  declarations: [
    ClientSchemaElementSaveComponent
  ],
  entryComponents: [
    ClientSchemaElementSaveComponent
  ]
})
export class FadqLibClientSchemaElementSaveModule {}
