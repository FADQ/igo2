import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';

import { IgoLanguageModule } from '@igo2/core/language';
import { IgoActionModule } from '@igo2/common/action';
import { IgoBackdropModule } from '@igo2/common/backdrop';
import { IgoContextMenuModule } from '@igo2/common/context-menu';
import { IgoEntityModule } from '@igo2/common/entity';
import { IgoPanelModule } from '@igo2/common/panel';
import { IgoWorkspaceModule } from '@igo2/common/workspace';
import {
  IgoFeatureModule,
  IgoImportExportModule,
  IgoQueryModule
} from '@igo2/geo';
import { IgoContextManagerModule } from '@igo2/context';
import { IgoAppSearchModule } from '@igo2/integration';

import { FadqInterneSearchModule } from '../../modules/search/search.module';

import { FadqContextModule } from '../../../..//apps/shared/modules/context/context.module';
import { FadqMapModule } from '../../../../apps/shared/modules/map/map.module';
import { FadqImportExportModule } from '../../../../apps/shared/modules/import-export/import-export.module';
import { FadqPortalModule } from '../../../..//apps/shared/views/portal/portal.module';

import { PortalComponent } from './portal.component';

@NgModule({
  imports: [
    CommonModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,

    IgoLanguageModule,
    IgoActionModule,
    IgoWorkspaceModule,
    IgoEntityModule,
    IgoPanelModule,
    IgoContextMenuModule,
    IgoBackdropModule,
    IgoFeatureModule,
    IgoImportExportModule,
    IgoQueryModule,
    IgoContextManagerModule,
    IgoAppSearchModule,

    FadqContextModule,
    FadqMapModule,
    FadqImportExportModule,
    FadqPortalModule,

    FadqInterneSearchModule
  ],
  exports: [PortalComponent],
  declarations: [PortalComponent]
})
export class FadqInternePortalModule {}
