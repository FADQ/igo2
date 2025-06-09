import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IgoPanelModule } from '@igo2/common/panel';
import { IgoStopPropagationModule } from '@igo2/common/stop-propagation';
import { IgoLanguageModule } from '@igo2/core/language';

import { ToastPanelComponent } from './toast-panel.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoPanelModule,
    IgoStopPropagationModule
  ],
  exports: [ToastPanelComponent],
  declarations: [ToastPanelComponent]
})
export class FadqToastPanelModule {}
