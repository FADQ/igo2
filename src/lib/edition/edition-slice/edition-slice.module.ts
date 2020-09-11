import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule } from '@igo2/core';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { EditionSliceComponent } from './edition-slice.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    FadqLibCardPanelModule
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
