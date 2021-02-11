import { NgModule } from '@angular/core';

import { IgoFilterModule } from '@igo2/geo';
import { provideOgcFilterWidget } from '@igo2/geo';
import { FadqImportExportToolModule } from './import-export-tool/import-export-tool.module';

@NgModule({
  imports: [
    IgoFilterModule,
    FadqImportExportToolModule
  ],
  exports: [
  ],
  declarations: [],
  providers: [
    provideOgcFilterWidget()
  ]
})
export class FadqImportExportModule {}
