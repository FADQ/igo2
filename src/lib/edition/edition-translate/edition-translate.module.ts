import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule } from '@igo2/core';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { EditionTranslateComponent } from './edition-translate.component';

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
    EditionTranslateComponent
  ],
  declarations: [
    EditionTranslateComponent
  ],
})
export class FadqLibEditionTranslateModule {}
