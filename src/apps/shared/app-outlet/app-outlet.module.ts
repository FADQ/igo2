import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';
import { IgoSpinnerModule, IgoStopPropagationModule } from '@igo2/common';

import { AppOutletComponent } from './app-outlet.component';

@NgModule({
  imports: [
    IgoMessageModule,
    IgoSpinnerModule,
    IgoStopPropagationModule,
  ],
  exports: [
    AppOutletComponent
  ],
  declarations: [
    AppOutletComponent
  ]
})
export class FadqAppOutletModule {}
