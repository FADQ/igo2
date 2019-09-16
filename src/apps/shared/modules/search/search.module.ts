import { NgModule } from '@angular/core';

import { IgoSearchModule } from '@igo2/geo';

@NgModule({
  imports: [
    IgoSearchModule.forRoot()
  ],
  exports: [
    IgoSearchModule
  ],
  declarations: []
})
export class FadqSearchModule {}
