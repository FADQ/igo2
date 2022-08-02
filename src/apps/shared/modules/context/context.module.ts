import { NgModule } from '@angular/core';

import { IgoContextModule } from '@igo2/context';
import { FadqLibContextModule } from 'src/lib/context/context.module'
import { FadqLayerContextDirective } from './shared/layer-context.directive';



@NgModule({
  imports: [
    IgoContextModule,
    FadqLibContextModule.forRoot()
  ],
  exports: [
    IgoContextModule,
    FadqLibContextModule,
    FadqLayerContextDirective
  ],
  declarations: [
    FadqLayerContextDirective
  ]
})
export class FadqContextModule {}
