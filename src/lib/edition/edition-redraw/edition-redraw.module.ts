import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

import { IgoLanguageModule } from '@igo2/core/language';
import { IgoFeatureFormModule } from '@igo2/geo';
import {
  IgoFormFieldModule,
  IgoFormGroupModule
} from '@igo2/common/form';


import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';
import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { EditionRedrawComponent } from './edition-redraw.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatTabsModule,
    IgoLanguageModule,
    IgoFeatureFormModule,
    IgoFormFieldModule,
    IgoFormGroupModule,
    FadqLibMessageInlineModule,
    FadqLibCardPanelModule
  ],
  exports: [
    EditionRedrawComponent
  ],
  declarations: [
    EditionRedrawComponent
  ],
})
export class FadqLibEditionRedrawModule {}
