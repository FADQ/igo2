import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoMapModule } from '@igo2/geo';
import { FadqLibMessageInlineModule } from './message-inline/message-inline.module';

@NgModule({
  imports: [
    CommonModule,
    FadqLibMessageInlineModule
  ],
  exports: [
    IgoMapModule,
    FadqLibMessageInlineModule
  ],
  declarations: []
})
export class FadqLibMapModule {}
