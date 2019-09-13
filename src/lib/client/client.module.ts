import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FadqLibEditionModule } from '../edition/edition.module';

import { provideClientService } from './shared/client.providers';

import { FadqLibClientInfoModule } from './info/client-info.module';
import { FadqLibClientParcelModule } from './parcel/client-parcel.module';
import { FadqLibClientParcelElementModule } from './parcel-element/client-parcel-element.module';
import { FadqLibClientSchemaModule } from './schema/client-schema.module';
import { FadqLibClientSchemaFileModule } from './schema-file/client-schema-file.module';
import { FadqLibClientSchemaElementModule } from './schema-element/client-schema-element.module';

@NgModule({
  imports: [
    CommonModule,
    FadqLibEditionModule.forRoot(),
    FadqLibClientInfoModule.forRoot(),
    FadqLibClientParcelModule.forRoot(),
    FadqLibClientSchemaModule.forRoot(),
    FadqLibClientSchemaFileModule.forRoot(),
    FadqLibClientSchemaElementModule.forRoot(),
    FadqLibClientParcelElementModule.forRoot()
  ],
  exports: [
    FadqLibClientInfoModule,
    FadqLibClientParcelModule,
    FadqLibClientParcelElementModule,
    FadqLibClientSchemaModule,
    FadqLibClientSchemaFileModule,
    FadqLibClientSchemaElementModule
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
