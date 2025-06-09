import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core/message';
import { IgoSpinnerModule } from '@igo2/common/spinner';
import { IgoStopPropagationModule } from '@igo2/common/stop-propagation';

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
