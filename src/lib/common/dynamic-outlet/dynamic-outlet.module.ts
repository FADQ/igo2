import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicOutletComponent } from './dynamic-outlet.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    DynamicOutletComponent
  ],
  declarations: [
    DynamicOutletComponent
  ]
})
export class FadqLibDynamicOutletModule {}