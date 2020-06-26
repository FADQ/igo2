import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoListModule, IgoCollapsibleModule } from '@igo2/common';

import { FadqLibClientParcelProModule } from 'src/lib/client/parcel-pro/client-parcel-pro.module';

import { ClientParcelToolComponent } from './client-parcel-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoListModule,
    IgoCollapsibleModule,
    FadqLibClientParcelProModule
  ],
  declarations: [
    ClientParcelToolComponent,
  ],
  exports: [ClientParcelToolComponent],
  entryComponents: [ClientParcelToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqClientParcelToolModule {}
