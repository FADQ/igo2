import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';


import { IgoLanguageModule } from '@igo2/core';

import { EditionSlicerComponent } from './edition-slicer.component';

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
    EditionSlicerComponent
  ],
  declarations: [
    EditionSlicerComponent
  ],
  entryComponents: [
    EditionSlicerComponent
  ]
})
export class FadqLibEditionSlicerModule {}
