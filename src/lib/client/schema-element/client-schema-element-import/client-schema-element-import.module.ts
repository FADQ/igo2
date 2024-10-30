import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

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
