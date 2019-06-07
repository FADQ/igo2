import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule, IgoFormModule } from '@igo2/common';

import { EditionImportComponent } from './edition-import.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule,
    IgoEntityTableModule
  ],
  exports: [
    EditionImportComponent
  ],
  declarations: [
    EditionImportComponent
  ],
  entryComponents: [
    EditionImportComponent
  ]
})
export class FadqLibEditionImportModule {}