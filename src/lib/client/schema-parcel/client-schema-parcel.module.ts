import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FadqLibClientSchemaParcelTransferModule
} from './client-schema-parcel-transfer/client-schema-parcel-transfer.module';
import {
  provideClientSchemaParcelTransferWidget
} from './shared/client-schema-parcel.widgets';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibClientSchemaParcelTransferModule
  ],
  declarations: []
})
export class FadqLibClientSchemaParcelModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibClientSchemaParcelModule,
      providers: [
        provideClientSchemaParcelTransferWidget()
      ]
    };
  }
}
