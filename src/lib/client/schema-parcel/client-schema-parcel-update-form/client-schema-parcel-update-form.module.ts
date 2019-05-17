import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatTabsModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import {
  ClientSchemaParcelUpdateFormComponent
} from './client-schema-parcel-update-form.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatTabsModule,
    IgoLanguageModule,
    IgoFeatureFormModule
  ],
  exports: [
    ClientSchemaParcelUpdateFormComponent
  ],
  declarations: [
    ClientSchemaParcelUpdateFormComponent
  ],
  entryComponents: [
    ClientSchemaParcelUpdateFormComponent
  ]
})
export class FadqLibClientSchemaParcelUpdateFormModule {}
