import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { ClientSchemaUpdateComponent } from './client-schema-update.component';

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
    ClientSchemaUpdateComponent
  ],
  declarations: [
    ClientSchemaUpdateComponent
  ],
  entryComponents: [
    ClientSchemaUpdateComponent
  ]
})
export class FadqLibClientSchemaUpdateModule {}
