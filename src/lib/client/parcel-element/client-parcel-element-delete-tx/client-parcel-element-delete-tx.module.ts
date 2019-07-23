import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { ClientParcelElementDeleteTxComponent } from './client-parcel-element-delete-tx.component';

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
    ClientParcelElementDeleteTxComponent
  ],
  declarations: [
    ClientParcelElementDeleteTxComponent
  ],
  entryComponents: [
    ClientParcelElementDeleteTxComponent
  ]
})
export class FadqLibClientParcelElementDeleteTxModule {}
