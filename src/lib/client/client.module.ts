import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FadqLibEditionModule } from '../edition/edition.module';

import { provideClientService } from './shared/client.providers';

import { FadqLibClientInfoModule } from './info/client-info.module';
import { FadqLibClientParcelModule } from './parcel/client-parcel.module';
import { FadqLibClientParcelElementModule } from './parcel-element/client-parcel-element.module';
<<<<<<< HEAD
import { FadqLibClientParcelTxModule } from './parcel-tx/client-parcel-tx.module';
<<<<<<< HEAD
=======
import { FadqLibClientParcelProModule } from './parcel-pro/client-parcel-pro.module';
>>>>>>> e6d63713... wip: proto scaffolding and update tool
=======
import { FadqLibClientParcelProModule } from './parcel-pro/client-parcel-pro.module';
>>>>>>> 7bddd8f0... wip: proto scaffolding and update tool
import { FadqLibClientSchemaModule } from './schema/client-schema.module';
import { FadqLibClientSchemaFileModule } from './schema-file/client-schema-file.module';
import { FadqLibClientSchemaElementModule } from './schema-element/client-schema-element.module';

@NgModule({
  imports: [
    CommonModule,
    FadqLibEditionModule.forRoot(),
    FadqLibClientInfoModule.forRoot(),
    FadqLibClientParcelModule.forRoot(),
    FadqLibClientParcelElementModule.forRoot(),
    FadqLibClientParcelTxModule.forRoot(),
    FadqLibClientSchemaModule.forRoot(),
    FadqLibClientSchemaFileModule.forRoot(),
<<<<<<< HEAD
<<<<<<< HEAD
    FadqLibClientSchemaElementModule.forRoot()
=======
    FadqLibClientSchemaElementModule.forRoot(),
    FadqLibClientParcelElementModule.forRoot(),
    FadqLibClientParcelProModule.forRoot()
>>>>>>> e6d63713... wip: proto scaffolding and update tool
=======
    FadqLibClientSchemaElementModule.forRoot(),
    FadqLibClientParcelElementModule.forRoot(),
    FadqLibClientParcelProModule.forRoot()
>>>>>>> 7bddd8f0... wip: proto scaffolding and update tool
  ],
  exports: [
    FadqLibClientInfoModule,
    FadqLibClientParcelModule,
    FadqLibClientParcelElementModule,
    FadqLibClientParcelTxModule,
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
