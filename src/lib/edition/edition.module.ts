import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FadqLibEditionUpsertModule } from './edition-upsert/edition-upsert.module';
import { FadqLibEditionUpdateBatchModule } from './edition-update-batch/edition-update-batch.module';
import { FadqLibEditionFillModule } from './edition-fill/edition-fill.module';
import { FadqLibEditionImportModule } from './edition-import/edition-import.module';
import { FadqLibEditionRedrawModule } from './edition-redraw/edition-redraw.module';
import { FadqLibEditionSaveModule } from './edition-save/edition-save.module';
import { FadqLibEditionSliceModule } from './edition-slice/edition-slice.module';
import { FadqLibEditionTranslateModule } from './edition-translate/edition-translate.module';
import { FadqLibEditionUndoModule } from './edition-undo/edition-undo.module';

import {
  provideEditionUpsertWidget,
  provideEditionUpdateBatchWidget,
  provideEditionFillWidget,
  provideEditionImportWidget,
  provideEditionRedrawWidget,
  provideEditionSaveWidget,
  provideEditionSliceWidget,
  provideEditionTranslateWidget,
  provideEditionUndoWidget
} from './shared/edition.widgets';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibEditionUpsertModule,
    FadqLibEditionUpdateBatchModule,
    FadqLibEditionFillModule,
    FadqLibEditionImportModule,
    FadqLibEditionRedrawModule,
    FadqLibEditionSaveModule,
    FadqLibEditionSliceModule,
    FadqLibEditionTranslateModule,
    FadqLibEditionUndoModule
  ],
  declarations: []
})
export class FadqLibEditionModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibEditionModule,
      providers: [
        provideEditionUpsertWidget(),
        provideEditionUpdateBatchWidget(),
        provideEditionFillWidget(),
        provideEditionImportWidget(),
        provideEditionRedrawWidget(),
        provideEditionSaveWidget(),
        provideEditionSliceWidget(),
        provideEditionTranslateWidget(),
        provideEditionUndoWidget()
      ]
    };
  }
}
