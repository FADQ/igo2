import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material';

import { MessageInlineComponent } from './message-inline.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule
  ],
  exports: [MessageInlineComponent],
  declarations: [MessageInlineComponent]
})
export class FadqLibMessageInlineModule {}
