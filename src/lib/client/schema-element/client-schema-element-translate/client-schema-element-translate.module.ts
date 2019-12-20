import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientSchemaElementTranslateComponent } from './client-schema-element-translate.component';

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
    ClientSchemaElementTranslateComponent
  ],
  declarations: [
    ClientSchemaElementTranslateComponent
  ],
  entryComponents: [
    ClientSchemaElementTranslateComponent
  ]
})
export class FadqLibClientSchemaElementTranslateModule {}
