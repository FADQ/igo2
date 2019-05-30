import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FadqLibEditionFormModule } from './edition-form/edition-form.module';
import { FadqLibEditionSlicerModule } from './edition-slicer/edition-slicer.module';
import { FadqLibEditionUndoModule } from './edition-undo/edition-undo.module';

// import {
//   FadqLibEditionUpdateFormModule
// } from './edition-update-form/edition-update-form.module';
// import {
//   FadqLibEditionReincludeFormModule
// } from './edition-reinclude-form/edition-reinclude-form.module';
// import {
//   FadqLibEditionSliceFormModule
// } from './edition-slice-form/edition-slice-form.module';
// import {
//   FadqLibEditionSaverModule
// } from './edition-saver/edition-saver.module';
// import {
//   FadqLibEditionUndoModule
// } from './edition-undo/edition-undo.module';
// import {
//   FadqLibEditionImportDataModule
// } from './edition-import-data/edition-import-data.module';

// import {
//   provideEditionPointService,
//   provideEditionLineService,
//   provideEditionSurfaceService,
//   provideEditionService,
// } from './shared/edition.providers';
import {
  provideEditionFormWidget,
  provideEditionSlicerWidget,
  provideEditionUndoWidget
  // provideEditionUpdateWidget,
  // provideEditionReincludeWidget,
  // provideEditionSliceWidget,
  // provideEditionSaverWidget,
  // provideEditionUndoWidget,
  // provideEditionImportDataWidget
} from './shared/edition.widgets';
// import { EditionFormService } from './shared/edition-form.service';
// import { EditionTableService } from './shared/edition-table.service';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibEditionFormModule,
    FadqLibEditionSlicerModule,
    FadqLibEditionUndoModule,
    // FadqLibEditionUpdateFormModule,
    // FadqLibEditionReincludeFormModule,
    // FadqLibEditionSliceFormModule,
    // FadqLibEditionSaverModule,
    // FadqLibEditionUndoModule,
    // FadqLibEditionImportDataModule
  ],
  declarations: []
})
export class FadqLibEditionModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibEditionModule,
      providers: [
        // provideEditionPointService(),
        // provideEditionLineService(),
        // provideEditionSurfaceService(),
        // provideEditionService(),
        provideEditionFormWidget(),
        provideEditionSlicerWidget(),
        provideEditionUndoWidget(),
        // provideEditionUpdateWidget(),
        // provideEditionReincludeWidget(),
        // provideEditionSliceWidget(),
        // provideEditionSaverWidget(),
        // provideEditionUndoWidget(),
        // provideEditionImportDataWidget(),
        // EditionFormService,
        // EditionTableService
      ]
    };
  }
}
