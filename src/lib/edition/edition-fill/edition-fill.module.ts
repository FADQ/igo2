import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule, IgoFormModule } from '@igo2/common';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { EditionFillComponent } from './edition-fill.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule,
    IgoEntityTableModule,
    FadqLibCardPanelModule
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
