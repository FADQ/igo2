import { NgModule } from '@angular/core';

import { FadqLibEditionModule } from 'src/lib/edition/edition.module';

@NgModule({
  imports: [
    FadqLibEditionModule.forRoot()
  ],
  exports: [
    FadqLibEditionModule
  ],
  declarations: []
})
export class FadqInterneEditionModule {}
