import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatTabsModule,
  MatIconModule,
  MatButtonModule,
  MatTooltipModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoLayerModule } from '@igo2/geo';
import { IgoAppCatalogModule } from '@igo2/integration';

import { MapToolComponent } from './map-tool.component';
import { LayerInfoDialogComponent } from './layer-info-dialog.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoLanguageModule,
    IgoLayerModule,
    IgoAppCatalogModule
  ],
  declarations: [
    MapToolComponent,
    LayerInfoDialogComponent
  ],
  exports: [MapToolComponent],
  entryComponents: [
    MapToolComponent,
    LayerInfoDialogComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqMapToolModule {}
