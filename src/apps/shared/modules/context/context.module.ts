import { NgModule } from '@angular/core';

import { IgoContextModule } from '@igo2/context';
import { FadqLayerContextDirective } from './shared/layer-context.directive';


@NgModule({
  imports: [
    IgoContextModule
  ],
  exports: [
    IgoContextModule,
    FadqLayerContextDirective
  ],
  declarations: [
    FadqLayerContextDirective
  ]
})
export class FadqContextModule {}
