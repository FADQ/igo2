import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';

import { IgoLanguageModule } from '@igo2/core';
import {
  IgoActionModule,
  IgoContextMenuModule,
  IgoWorkspaceModule,
  IgoEntityModule,
  IgoPanelModule,
  IgoBackdropModule,
  IgoToolModule
} from '@igo2/common';
import {
  IgoFeatureModule,
  IgoImportExportModule,
  IgoQueryModule
} from '@igo2/geo';
import { IgoContextManagerModule } from '@igo2/context';
import { IgoAppSearchModule } from '@igo2/integration';

import { FadqPesSearchModule } from '../../modules/search/search.module';

import { FadqMapModule } from 'src/apps/shared/modules/map/map.module';
import { FadqImportExportModule } from 'src/apps/shared/modules/import-export/import-export.module';
import { FadqPortalModule } from 'src/apps/shared/views/portal/portal.module';

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
    IgoToolModule,
    IgoContextMenuModule,
    IgoBackdropModule,
    IgoFeatureModule,
    IgoImportExportModule,
    IgoQueryModule,
    IgoContextManagerModule,
    IgoAppSearchModule,

    FadqMapModule,
    FadqImportExportModule,
    FadqPortalModule,

    FadqPesSearchModule
  ],
  exports: [PortalComponent],
  declarations: [PortalComponent]
})
export class FadqPesPortalModule {}
