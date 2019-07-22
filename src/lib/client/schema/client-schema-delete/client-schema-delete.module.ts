import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { ClientSchemaDeleteComponent } from './client-schema-delete.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule,
    FadqLibCardPanelModule
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
