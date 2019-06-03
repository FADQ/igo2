import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { ClientSchemaDeleteComponent } from './client-schema-delete.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule,
  ],
  exports: [
    ClientSchemaDeleteComponent
  ],
  declarations: [
    ClientSchemaDeleteComponent
  ],
  entryComponents: [
    ClientSchemaDeleteComponent
  ]
})
export class FadqLibClientSchemaDeleteModule {}
