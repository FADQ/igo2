import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { provideClientService } from './shared/client.providers';

import { FadqLibClientInfoModule } from './info/client-info.module';
import { FadqLibClientParcelModule } from './parcel/client-parcel.module';
import { FadqLibClientSchemaModule } from './schema/client-schema.module';
import { FadqLibClientSchemaFileModule } from './schema-file/client-schema-file.module';
import { FadqLibClientSchemaElementModule } from './schema-element/client-schema-element.module';
import { FadqLibClientSchemaParcelModule } from './schema-parcel/client-schema-parcel.module';
import { FadqLibClientWorkspaceModule } from './workspace/client-workspace.module';

@NgModule({
  imports: [
    CommonModule,
    FadqLibClientInfoModule.forRoot(),
    FadqLibClientParcelModule.forRoot(),
    FadqLibClientSchemaModule.forRoot(),
    FadqLibClientSchemaFileModule.forRoot(),
    FadqLibClientSchemaElementModule.forRoot(),
    FadqLibClientSchemaParcelModule.forRoot(),
    FadqLibClientWorkspaceModule
  ],
  exports: [
    FadqLibClientInfoModule,
    FadqLibClientParcelModule,
    FadqLibClientSchemaModule,
    FadqLibClientSchemaFileModule,
    FadqLibClientSchemaElementModule,
    FadqLibClientSchemaParcelModule,
    FadqLibClientWorkspaceModule
  ],
  declarations: []
})
export class FadqLibClientModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FadqLibClientModule,
      providers: [
        provideClientService()
      ]
    };
  }
}
