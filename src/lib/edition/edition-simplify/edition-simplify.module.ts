import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { EditionSimplifyComponent } from './edition-simplify.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    IgoLanguageModule,
    FadqLibCardPanelModule
  ],
  exports: [
    EditionSimplifyComponent
  ],
  declarations: [
    EditionSimplifyComponent
  ],
  entryComponents: [
    EditionSimplifyComponent
  ]
})
export class FadqLibEditionSimplifyModule {}
