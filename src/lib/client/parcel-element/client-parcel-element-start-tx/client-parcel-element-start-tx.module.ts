import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { ClientParcelElementStartTxComponent } from './client-parcel-element-start-tx.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    FadqLibCardPanelModule
  ],
  exports: [
    ClientParcelElementStartTxComponent
  ],
  declarations: [
    ClientParcelElementStartTxComponent
  ],
  entryComponents: [
    ClientParcelElementStartTxComponent
  ]
})
export class FadqLibClientParcelElementStartTxModule {}
