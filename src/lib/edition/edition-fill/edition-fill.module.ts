import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule, IgoFormModule } from '@igo2/common';

import {
  EditionFillComponent
} from './edition-fill.component';

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
    IgoFormModule,
    IgoEntityTableModule
  ],
  exports: [
    EditionFillComponent
  ],
  declarations: [
    EditionFillComponent
  ],
  entryComponents: [
    EditionFillComponent
  ]
})
export class FadqLibEditionFillModule {}
