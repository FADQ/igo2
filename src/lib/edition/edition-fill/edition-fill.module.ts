import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule } from '@igo2/core/language';
import { IgoEntityTableModule } from '@igo2/common/entity';
import { IgoFormModule } from '@igo2/common/form';

import { FadqLibCardPanelModule } from '../../../../src/lib/misc/card-panel/card-panel.module';

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
})
export class FadqLibEditionFillModule {}
