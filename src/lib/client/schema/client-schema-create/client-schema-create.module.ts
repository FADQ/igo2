import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { ClientSchemaCreateComponent } from './client-schema-create.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule
  ],
  exports: [
    ClientSchemaCreateComponent
  ],
  declarations: [
    ClientSchemaCreateComponent
  ],
  entryComponents: [
    ClientSchemaCreateComponent
  ]
})
export class FadqLibClientSchemaCreateModule {}
