import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';
import { ToolService } from '@igo2/common';
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
  entryComponents: [MapToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqMapToolModule {}


ToolService.register({
  name: 'fadqMap',
  title: 'tools.map',
  icon: 'map',
  component: MapToolComponent
});
