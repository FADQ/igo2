import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FadqLibClientParcelProUpdateBatchModule
} from './client-parcel-pro-update-batch/client-parcel-pro-update-batch.module';

import {
  provideClientParcelProService,
  provideClientParcelProFormService
} from './shared/client-parcel-pro.providers';
import {
  provideClientParcelProUpdateBatchWidget
} from './shared/client-parcel-pro.widgets';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibClientParcelProUpdateBatchModule
  ],
  declarations: []
})
export class FadqLibClientParcelProModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibClientParcelProModule,
      providers: [
        provideClientParcelProService(),
        provideClientParcelProFormService(),
        provideClientParcelProUpdateBatchWidget()
      ]
    };
  }
}
