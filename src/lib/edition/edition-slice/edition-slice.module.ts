import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';


import { IgoLanguageModule } from '@igo2/core';

import { EditionSliceComponent } from './edition-slice.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule
  ],
  exports: [
    EditionSliceComponent
  ],
  declarations: [
    EditionSliceComponent
  ],
  entryComponents: [
    EditionSliceComponent
  ]
})
export class FadqLibEditionSliceModule {}
