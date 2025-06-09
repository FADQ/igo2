import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import { IgoPanelModule } from '@igo2/common/panel';
import { IgoFlexibleModule } from '@igo2/common/flexible';
import { IgoToolModule } from '@igo2/common/tool';

import { SidenavComponent } from './sidenav.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatTooltipModule,
    IgoLanguageModule,
    IgoPanelModule,
    IgoFlexibleModule,
    IgoToolModule
  ],
  exports: [SidenavComponent],
  declarations: [SidenavComponent]
})
export class FadqSidenavModule {}
