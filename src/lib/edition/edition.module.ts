import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FadqLibEditionFormModule } from './edition-form/edition-form.module';
import { FadqLibEditionFillModule } from './edition-fill/edition-fill.module';
import { FadqLibEditionImportModule } from './edition-import/edition-import.module';
import { FadqLibEditionSaveModule } from './edition-save/edition-save.module';
import { FadqLibEditionSliceModule } from './edition-slice/edition-slice.module';
import { FadqLibEditionUndoModule } from './edition-undo/edition-undo.module';

import {
  provideEditionFormWidget,
  provideEditionFillWidget,
  provideEditionImportWidget,
  provideEditionSaveWidget,
  provideEditionSliceWidget,
  provideEditionUndoWidget
} from './shared/edition.widgets';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibEditionFormModule,
    FadqLibEditionFillModule,
    FadqLibEditionImportModule,
    FadqLibEditionSaveModule,
    FadqLibEditionSliceModule,
    FadqLibEditionUndoModule
  ],
  declarations: []
})
export class FadqLibEditionModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibEditionModule,
      providers: [
        provideEditionFormWidget(),
        provideEditionFillWidget(),
        provideEditionImportWidget(),
        provideEditionSaveWidget(),
        provideEditionSliceWidget(),
        provideEditionUndoWidget()
      ]
    };
  }
}
