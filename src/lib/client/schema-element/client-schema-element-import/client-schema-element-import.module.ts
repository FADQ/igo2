import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core/language';
import { IgoFormModule } from '@igo2/common/form';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientSchemaElementImportComponent } from './client-schema-element-import.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoFormModule,
    FadqLibEditionModule
  ],
  exports: [
    ClientSchemaElementImportComponent
  ],
  declarations: [
    ClientSchemaElementImportComponent
  ],
})
export class FadqLibClientSchemaElementImportModule {}
