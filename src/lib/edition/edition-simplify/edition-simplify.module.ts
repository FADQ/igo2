import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';

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
    MatButtonModule,
    MatSliderModule,
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
