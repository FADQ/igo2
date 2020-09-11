import { NgModule, ModuleWithProviders } from '@angular/core';

import { FadqLibClientModule } from 'src/lib/client/client.module';

import { FadqClientParcelTxDeleteDialogModule } from './client-parcel-tx-delete-dialog/client-parcel-tx-delete-dialog.module';
import { FadqClientParcelTxStartModule } from './client-parcel-tx-start/client-parcel-tx-start.module';
import { FadqClientToolModule } from './client-tool/client-tool.module';
import { FadqClientParcelTxToolModule } from './client-parcel-tx-tool/client-parcel-tx-tool.module';
import { provideClientParcelTxStartWidget } from './shared/client-parcel-tx.widgets';

@NgModule({
  imports: [
    FadqLibClientModule.forRoot(),
    FadqClientParcelTxDeleteDialogModule,
    FadqClientParcelTxStartModule,
    FadqClientToolModule,
    FadqClientParcelTxToolModule
  ],
  exports: [
    FadqLibClientModule
  ],
  declarations: []
})
export class FadqInterneClientModule {
  static forRoot(): ModuleWithProviders<FadqInterneClientModule> {
    return {
      ngModule: FadqInterneClientModule,
      providers: [
        provideClientParcelTxStartWidget()
      ]
    };
  }
}
