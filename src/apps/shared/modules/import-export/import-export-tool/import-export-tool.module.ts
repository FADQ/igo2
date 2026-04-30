import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IgoImportExportModule } from '@igo2/geo';

import { TOOL_CONFIG } from 'src/lib/core/core.module';

import { ImportExportToolComponent } from './import-export-tool.component';

@NgModule({
  imports: [
    IgoImportExportModule
  ],
  declarations: [ImportExportToolComponent],
  exports: [ImportExportToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: TOOL_CONFIG,
      useValue: {
        name: 'fadqImportExport',
        title: 'igo.integration.tools.importExport',
        icon: 'file-move',
        component: ImportExportToolComponent
      },
      multi: true
    },
  ]
})
export class FadqImportExportToolModule {}
