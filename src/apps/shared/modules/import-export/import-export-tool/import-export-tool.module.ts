import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ToolService } from '@igo2/common';
import { IgoImportExportModule } from '@igo2/geo';

import { ImportExportToolComponent } from './import-export-tool.component';

@NgModule({
  imports: [
    IgoImportExportModule
  ],
  declarations: [ImportExportToolComponent],
  exports: [ImportExportToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqImportExportToolModule {}

ToolService.register({
  name: 'fadqImportExport',
  title: 'igo.integration.tools.importExport',
  icon: 'file-move',
  component: ImportExportToolComponent
});
