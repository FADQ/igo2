import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { FadqLibMessageInlineModule } from 'src/lib/message/message-inline/message-inline.module';

import { CardPanelComponent } from './card-panel.component';
import { CardPanelContentComponent } from './card-panel-content.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    FadqLibMessageInlineModule
  ],
  exports: [
    CardPanelComponent,
    CardPanelContentComponent
  ],
  declarations: [
    CardPanelComponent,
    CardPanelContentComponent
  ]
})
export class FadqLibCardPanelModule {}
