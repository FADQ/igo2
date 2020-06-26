import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatGridListModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { ClientParcelProLegendComponent } from './client-parcel-pro-legend.component';
import { ClientParcelProLegendItemComponent } from './client-parcel-pro-legend-item.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatGridListModule,
    IgoLanguageModule
  ],
  exports: [
    ClientParcelProLegendComponent
  ],
  declarations: [
    ClientParcelProLegendComponent,
    ClientParcelProLegendItemComponent
  ]
})
export class FadqLibClientParcelProLegendModule {}
