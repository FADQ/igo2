import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatTooltipModule,
  MatIconModule,
  MatButtonModule,
  MatMenuModule,
  MatSidenavModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import {
  IgoActionModule,
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

import { FadqInterneSearchModule } from '../../modules/search/search.module';

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
    IgoBackdropModule,
    IgoFeatureModule,
    IgoImportExportModule,
    IgoQueryModule,
    IgoContextManagerModule,
    IgoAppSearchModule,

    FadqMapModule,
    FadqImportExportModule,
    FadqPortalModule,

    FadqInterneSearchModule
  ],
  exports: [PortalComponent],
  declarations: [PortalComponent]
})
export class FadqInternePortalModule {}
