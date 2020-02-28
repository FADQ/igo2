import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FadqLibClientParcelTxReconciliateModule
} from './client-parcel-tx-reconciliate/client-parcel-tx-reconciliate.module';

import { provideClientParcelTxService } from './shared/client-parcel-tx.providers';
import { provideClientParcelTxReconciliateWidget } from './shared/client-parcel-tx.widgets';

@NgModule({
  imports: [
    CommonModule,
    FadqLibClientParcelTxReconciliateModule
  ],
  exports: [
    FadqLibClientParcelTxReconciliateModule
  ],
  declarations: []
})
export class FadqLibClientParcelTxModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibClientParcelTxModule,
      providers: [
        provideClientParcelTxService(),
        provideClientParcelTxReconciliateWidget()
      ]
    };
  }
}
