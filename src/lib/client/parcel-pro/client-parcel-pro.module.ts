import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FadqLibClientParcelProLegendModule
} from './client-parcel-pro-legend/client-parcel-pro-legend.module';
import {
  FadqLibClientParcelProUpdateBatchModule
} from './client-parcel-pro-update-batch/client-parcel-pro-update-batch.module';
import {
  FadqLibClientParcelProWizardModule
} from './client-parcel-pro-wizard/client-parcel-pro-wizard.module';

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
    FadqLibClientParcelProLegendModule,
    FadqLibClientParcelProUpdateBatchModule,
    FadqLibClientParcelProWizardModule
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
