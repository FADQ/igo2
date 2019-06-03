import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FadqLibClientSchemaCreateModule } from './client-schema-create/client-schema-create.module';
import { FadqLibClientSchemaUpdateModule } from './client-schema-update/client-schema-update.module';
import { FadqLibClientSchemaDeleteModule } from './client-schema-delete/client-schema-delete.module';
import { FadqLibClientSchemaDuplicateModule } from './client-schema-duplicate/client-schema-duplicate.module';
import { FadqLibClientSchemaTransferModule } from './client-schema-transfer/client-schema-transfer.module';
import { FadqLibClientSchemaSelectorModule } from './client-schema-selector/client-schema-selector.module';

import {
  provideClientSchemaService,
  provideClientSchemaFormService
} from './shared/client-schema.providers';
import {
  provideClientSchemaCreateWidget,
  provideClientSchemaUpdateWidget,
  provideClientSchemaDeleteWidget,
  provideClientSchemaDuplicateWidget,
  provideClientSchemaTransferWidget,
  provideClientSchemaFileManagerWidget
} from './shared/client-schema.widgets';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibClientSchemaCreateModule,
    FadqLibClientSchemaUpdateModule,
    FadqLibClientSchemaDeleteModule,
    FadqLibClientSchemaDuplicateModule,
    FadqLibClientSchemaTransferModule,
    FadqLibClientSchemaSelectorModule
  ],
  declarations: []
})
export class FadqLibClientSchemaModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibClientSchemaModule,
      providers: [
        provideClientSchemaService(),
        provideClientSchemaFormService(),
        provideClientSchemaCreateWidget(),
        provideClientSchemaUpdateWidget(),
        provideClientSchemaDeleteWidget(),
        provideClientSchemaDuplicateWidget(),
        provideClientSchemaTransferWidget(),
        provideClientSchemaFileManagerWidget()
      ]
    };
  }
}
