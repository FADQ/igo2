import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { IgoImportExportModule } from '@igo2/geo';

import { ImportExportToolComponent } from './import-export-tool.component';

@NgModule({
  imports: [
    IgoImportExportModule
  ],
  declarations: [ImportExportToolComponent],
  exports: [ImportExportToolComponent],
  entryComponents: [ImportExportToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqImportExportToolModule {}
