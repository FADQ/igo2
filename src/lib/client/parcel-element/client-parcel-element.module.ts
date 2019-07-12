import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';


import {
  FadqLibClientParcelElementCreateModule
} from './client-parcel-element-create/client-parcel-element-create.module';
import {
  FadqLibClientParcelElementEditModule
} from './client-parcel-element-edit/client-parcel-element-edit.module';
import {
  FadqLibClientParcelElementUpdateModule
} from './client-parcel-element-update/client-parcel-element-update.module';
import {
  FadqLibClientParcelElementUpdateBatchModule
} from './client-parcel-element-update-batch/client-parcel-element-update-batch.module';
import {
  FadqLibClientParcelElementFillModule
} from './client-parcel-element-fill/client-parcel-element-fill.module';
import {
  FadqLibClientParcelElementNumberingModule
} from './client-parcel-element-numbering/client-parcel-element-numbering.module';
import {
  FadqLibClientParcelElementReconciliateModule
} from './client-parcel-element-reconciliate/client-parcel-element-reconciliate.module';
import {
  FadqLibClientParcelElementSliceModule
} from './client-parcel-element-slice/client-parcel-element-slice.module';
import {
  FadqLibClientParcelElementSaveModule
} from './client-parcel-element-save/client-parcel-element-save.module';
import {
  FadqLibClientParcelElementImportModule
} from './client-parcel-element-import/client-parcel-element-import.module';
import {
  FadqLibClientParcelElementTransactionModule
} from './client-parcel-element-transaction/client-parcel-element-transaction.module';
import {
  FadqLibClientParcelElementTransferModule
} from './client-parcel-element-transfer/client-parcel-element-transfer.module';

import {
  provideClientParcelElementService,
  provideClientParcelElementFormService
} from './shared/client-parcel-element.providers';
import {
  provideClientParcelElementCreateWidget,
  provideClientParcelElementEditWidget,
  provideClientParcelElementUpdateWidget,
  provideClientParcelElementUpdateBatchWidget,
  provideClientParcelElementFillWidget,
  provideClientParcelElementNumberingWidget,
  provideClientParcelElementReconciliateWidget,
  provideClientParcelElementSliceWidget,
  provideClientParcelElementSaveWidget,
  provideClientParcelElementImportWidget,
  provideClientParcelElementTransferWidget
} from './shared/client-parcel-element.widgets';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibClientParcelElementCreateModule,
    FadqLibClientParcelElementEditModule,
    FadqLibClientParcelElementUpdateModule,
    FadqLibClientParcelElementUpdateBatchModule,
    FadqLibClientParcelElementFillModule,
    FadqLibClientParcelElementNumberingModule,
    FadqLibClientParcelElementReconciliateModule,
    FadqLibClientParcelElementSliceModule,
    FadqLibClientParcelElementSaveModule,
    FadqLibClientParcelElementImportModule,
    FadqLibClientParcelElementTransactionModule,
    FadqLibClientParcelElementTransferModule
  ],
  declarations: []
})
export class FadqLibClientParcelElementModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibClientParcelElementModule,
      providers: [
        provideClientParcelElementService(),
        provideClientParcelElementFormService(),
        provideClientParcelElementCreateWidget(),
        provideClientParcelElementEditWidget(),
        provideClientParcelElementUpdateWidget(),
        provideClientParcelElementUpdateBatchWidget(),
        provideClientParcelElementFillWidget(),
        provideClientParcelElementNumberingWidget(),
        provideClientParcelElementReconciliateWidget(),
        provideClientParcelElementSliceWidget(),
        provideClientParcelElementSaveWidget(),
        provideClientParcelElementImportWidget(),
        provideClientParcelElementTransferWidget()
      ]
    };
  }
}
