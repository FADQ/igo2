import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientSchemaElementUpdateComponent } from './client-schema-element-update.component';

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
    ClientSchemaElementUpdateComponent
  ],
  declarations: [
    ClientSchemaElementUpdateComponent
  ],
})
export class FadqLibClientSchemaElementUpdateModule {}
