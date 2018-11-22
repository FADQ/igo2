import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatTooltipModule,
  MatIconModule,
  MatButtonModule,
  MatMenuModule,
  MatRadioModule,
  MatSidenavModule
} from '@angular/material';

import {
  IgoPanelModule,
  IgoBackdropModule,
  IgoFlexibleModule
} from '@igo2/common';
import {
  IgoCatalogModule,
  IgoDataSourceModule,
  IgoDownloadModule,
  // IgoFeatureModule,
  IgoFilterModule,
  IgoFormModule,
  IgoImportExportModule,
  IgoLayerModule,
  IgoMapModule,
  IgoMetadataModule,
  IgoOverlayModule,
  IgoPrintModule,
  // IgoQueryModule,
  IgoWktModule
} from '@igo2/geo';
import { IgoContextModule } from '@igo2/context';
import { IgoToolsModule } from '@igo2/tools';

import { FadqCoreModule } from '../../modules/core/core.module';
import { FadqEntityModule } from '../../modules/entity/entity.module';
import { FadqEditionModule } from '../../modules/edition/edition.module';
import { FadqClientModule } from '../../modules/client/client.module';
import { FadqMapModule } from '../../modules/map/map.module';
import { FadqSearchModule } from '../../modules/search/search.module';
import { FadqToolModule } from '../../modules/tool/tool.module';
import { FadqWidgetModule } from '../../modules/widget/widget.module';
import { FadqExpansionPanelModule } from './expansion-panel/expansion-panel.module';
import { FadqToastPanelModule } from './toast-panel/toast-panel.module';
import { FadqSidenavModule } from './sidenav/sidenav.module';

import { PortalComponent } from './portal.component';

@NgModule({
  imports: [
    CommonModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRadioModule,
    MatSidenavModule,
    IgoPanelModule,
    IgoBackdropModule,
    IgoFlexibleModule,

    IgoCatalogModule,
    IgoDataSourceModule,
    IgoDownloadModule,
    // IgoFeatureModule,
    IgoFilterModule,
    IgoFormModule,
    IgoImportExportModule,
    IgoLayerModule,
    IgoMapModule,
    IgoMetadataModule,
    IgoOverlayModule,
    IgoPrintModule,
    // IgoQueryModule,
    IgoWktModule,

    IgoContextModule,
    IgoToolsModule,
    FadqCoreModule,
    FadqEntityModule,
    FadqEditionModule,
    FadqClientModule,
    FadqExpansionPanelModule,
    FadqToastPanelModule,
    FadqSidenavModule,
    FadqMapModule,
    FadqSearchModule,
    FadqToolModule,
    FadqWidgetModule
  ],
  exports: [PortalComponent],
  declarations: [PortalComponent]
})
export class FadqPortalModule {}
