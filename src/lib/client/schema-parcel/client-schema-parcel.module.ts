import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FadqLibClientSchemaParcelCreateFormModule
} from './client-schema-parcel-create-form/client-schema-parcel-create-form.module';
import {
  FadqLibClientSchemaParcelUpdateFormModule
} from './client-schema-parcel-update-form/client-schema-parcel-update-form.module';
import {
  FadqLibClientSchemaParcelTransferFormModule
} from './client-schema-parcel-transfer-form/client-schema-parcel-transfer-form.module';
import {
  provideClientSchemaParcelCreateWidget,
  provideClientSchemaParcelUpdateWidget,
  provideClientSchemaParcelTransferFormWidget
} from './shared/client-schema-parcel.widgets';
import { ClientSchemaParcelFormService } from './shared/client-schema-parcel-form.service';
import { ClientSchemaParcelTableService } from './shared/client-schema-parcel-table.service';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibClientSchemaParcelCreateFormModule,
    FadqLibClientSchemaParcelUpdateFormModule,
    FadqLibClientSchemaParcelTransferFormModule
  ],
  declarations: []
})
export class FadqLibClientSchemaParcelModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibClientSchemaParcelModule,
      providers: [
        provideClientSchemaParcelCreateWidget(),
        provideClientSchemaParcelUpdateWidget(),
        provideClientSchemaParcelTransferFormWidget(),
        ClientSchemaParcelFormService,
        ClientSchemaParcelTableService
      ]
    };
  }
}
