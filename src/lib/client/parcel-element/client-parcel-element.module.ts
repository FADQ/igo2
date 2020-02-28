import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FadqLibClientParcelElementCreateModule
} from './client-parcel-element-create/client-parcel-element-create.module';
import {
  FadqLibClientParcelElementUpdateModule
} from './client-parcel-element-update/client-parcel-element-update.module';
import {
  FadqLibClientParcelElementUpdateBatchModule
} from './client-parcel-element-update-batch/client-parcel-element-update-batch.module';
import {
  FadqLibClientParcelElementRedrawModule
} from './client-parcel-element-redraw/client-parcel-element-redraw.module';
import {
  FadqLibClientParcelElementFillModule
} from './client-parcel-element-fill/client-parcel-element-fill.module';
import {
  FadqLibClientParcelElementNumberingModule
} from './client-parcel-element-numbering/client-parcel-element-numbering.module';
import {
  FadqLibClientParcelElementSimplifyModule
} from './client-parcel-element-simplify/client-parcel-element-simplify.module';
import {
  FadqLibClientParcelElementSliceModule
} from './client-parcel-element-slice/client-parcel-element-slice.module';
import {
  FadqLibClientParcelElementSaveModule
} from './client-parcel-element-save/client-parcel-element-save.module';
import {
  FadqLibClientParcelElementTranslateModule
} from './client-parcel-element-translate/client-parcel-element-translate.module';
import {
  FadqLibClientParcelElementImportModule
} from './client-parcel-element-import/client-parcel-element-import.module';
import {
  FadqLibClientParcelElementTransactionDialogModule
} from './client-parcel-element-transaction-dialog/client-parcel-element-transaction-dialog.module';
import {
  FadqLibClientParcelElementTransferModule
} from './client-parcel-element-transfer/client-parcel-element-transfer.module';
import {
  FadqLibClientParcelElementWithoutOwnerModule
} from './client-parcel-element-without-owner/client-parcel-element-without-owner.module';

import {
  provideClientParcelElementService,
  provideClientParcelElementFormService
} from './shared/client-parcel-element.providers';
import {
  provideClientParcelElementCreateWidget,
  provideClientParcelElementUpdateWidget,
  provideClientParcelElementUpdateBatchWidget,
  provideClientParcelElementRedrawWidget,
  provideClientParcelElementFillWidget,
  provideClientParcelElementNumberingWidget,
  provideClientParcelElementSimplifyWidget,
  provideClientParcelElementSliceWidget,
  provideClientParcelElementSaveWidget,
  provideClientParcelElementTranslateWidget,
  provideClientParcelElementImportWidget,
  provideClientParcelElementTransferWidget,
  provideClientParcelElementWithoutOwnerWidget
} from './shared/client-parcel-element.widgets';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibClientParcelElementCreateModule,
    FadqLibClientParcelElementUpdateModule,
    FadqLibClientParcelElementUpdateBatchModule,
    FadqLibClientParcelElementRedrawModule,
    FadqLibClientParcelElementFillModule,
    FadqLibClientParcelElementNumberingModule,
    FadqLibClientParcelElementSimplifyModule,
    FadqLibClientParcelElementSliceModule,
    FadqLibClientParcelElementSaveModule,
    FadqLibClientParcelElementTranslateModule,
    FadqLibClientParcelElementImportModule,
    FadqLibClientParcelElementTransactionDialogModule,
    FadqLibClientParcelElementTransferModule,
    FadqLibClientParcelElementWithoutOwnerModule
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
        provideClientParcelElementUpdateWidget(),
        provideClientParcelElementUpdateBatchWidget(),
        provideClientParcelElementRedrawWidget(),
        provideClientParcelElementFillWidget(),
        provideClientParcelElementNumberingWidget(),
        provideClientParcelElementSimplifyWidget(),
        provideClientParcelElementSliceWidget(),
        provideClientParcelElementSaveWidget(),
        provideClientParcelElementTranslateWidget(),
        provideClientParcelElementImportWidget(),
        provideClientParcelElementTransferWidget(),
        provideClientParcelElementWithoutOwnerWidget()
      ]
    };
  }
}
