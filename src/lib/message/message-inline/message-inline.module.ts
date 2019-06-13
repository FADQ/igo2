import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessageInlineComponent } from './message-inline.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule
  ],
  exports: [MessageInlineComponent],
  declarations: [MessageInlineComponent]
})
export class FadqLibMessageInlineModule {}
