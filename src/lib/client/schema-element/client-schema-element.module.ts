import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FadqLibClientSchemaElementCreateModule
} from './client-schema-element-create/client-schema-element-create.module';
import {
  FadqLibClientSchemaElementUpdateModule
} from './client-schema-element-update/client-schema-element-update.module';
import {
  FadqLibClientSchemaElementUpdateBatchModule
} from './client-schema-element-update-batch/client-schema-element-update-batch.module';
import {
  FadqLibClientSchemaElementFillModule
} from './client-schema-element-fill/client-schema-element-fill.module';
import {
  FadqLibClientSchemaElementSliceModule
} from './client-schema-element-slice/client-schema-element-slice.module';
import {
  FadqLibClientSchemaElementSaveModule
} from './client-schema-element-save/client-schema-element-save.module';
import {
  FadqLibClientSchemaElementTranslateModule
} from './client-schema-element-translate/client-schema-element-translate.module';
import {
  FadqLibClientSchemaElementImportModule
} from './client-schema-element-import/client-schema-element-import.module';
import {
  FadqLibClientSchemaElementCommitDialogModule
} from './client-schema-element-commit-dialog/client-schema-element-commit-dialog.module';

import {
  provideClientSchemaElementPointService,
  provideClientSchemaElementLineService,
  provideClientSchemaElementSurfaceService,
  provideClientSchemaElementService,
} from './shared/client-schema-element.providers';
import {
  provideClientSchemaElementCreateWidget,
  provideClientSchemaElementUpdateWidget,
  provideClientSchemaElementUpdateBatchWidget,
  provideClientSchemaElementFillWidget,
  provideClientSchemaElementSliceWidget,
  provideClientSchemaElementSaveWidget,
  provideClientSchemaElementTranslateWidget,
  provideClientSchemaElementImportWidget
} from './shared/client-schema-element.widgets';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibClientSchemaElementCreateModule,
    FadqLibClientSchemaElementUpdateModule,
    FadqLibClientSchemaElementUpdateBatchModule,
    FadqLibClientSchemaElementFillModule,
    FadqLibClientSchemaElementSliceModule,
    FadqLibClientSchemaElementSaveModule,
    FadqLibClientSchemaElementTranslateModule,
    FadqLibClientSchemaElementImportModule,
    FadqLibClientSchemaElementCommitDialogModule
  ],
  declarations: []
})
export class FadqLibClientSchemaElementModule {
  static forRoot(): ModuleWithProviders<FadqLibClientSchemaElementModule> {
    return {
      ngModule: FadqLibClientSchemaElementModule,
      providers: [
        provideClientSchemaElementPointService(),
        provideClientSchemaElementLineService(),
        provideClientSchemaElementSurfaceService(),
        provideClientSchemaElementService(),
        provideClientSchemaElementCreateWidget(),
        provideClientSchemaElementUpdateWidget(),
        provideClientSchemaElementUpdateBatchWidget(),
        provideClientSchemaElementFillWidget(),
        provideClientSchemaElementSliceWidget(),
        provideClientSchemaElementSaveWidget(),
        provideClientSchemaElementTranslateWidget(),
        provideClientSchemaElementImportWidget()
      ]
    };
  }
}
