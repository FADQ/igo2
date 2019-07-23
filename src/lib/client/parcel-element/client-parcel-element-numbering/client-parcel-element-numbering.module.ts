import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatIconModule,
  MatButtonModule,
  MatFormFieldModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule, IgoFormModule } from '@igo2/common';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { ClientParcelElementNumberingInputComponent } from './client-parcel-element-numbering-input.component';
import { ClientParcelElementNumberingComponent } from './client-parcel-element-numbering.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    IgoLanguageModule,
    IgoFormModule,
    IgoEntityTableModule,
    FadqLibCardPanelModule
  ],
  exports: [
    ClientParcelElementNumberingComponent
  ],
  declarations: [
    ClientParcelElementNumberingInputComponent,
    ClientParcelElementNumberingComponent
  ],
  entryComponents: [
    ClientParcelElementNumberingComponent
  ]
})
export class FadqLibClientParcelElementNumberingModule {}
