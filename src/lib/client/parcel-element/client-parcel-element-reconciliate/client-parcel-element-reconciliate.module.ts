import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule } from '@igo2/common';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { ClientParcelElementReconciliateComponent } from './client-parcel-element-reconciliate.component';

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
    IgoEntityTableModule,
    FadqLibCardPanelModule
  ],
  exports: [
    ClientParcelElementReconciliateComponent
  ],
  declarations: [
    ClientParcelElementReconciliateComponent
  ],
  entryComponents: [
    ClientParcelElementReconciliateComponent
  ]
})
export class FadqLibClientParcelElementReconciliateModule {}
