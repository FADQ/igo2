import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatGridListModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { ClientParcelProLegendComponent } from './client-parcel-pro-legend.component';
import { ClientParcelProLegendThumbnailComponent } from './client-parcel-pro-legend-thumbnail.component';

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
    ClientParcelProLegendThumbnailComponent
  ]
})
export class FadqLibClientParcelProLegendModule {}
