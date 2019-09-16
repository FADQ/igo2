import { NgModule } from '@angular/core';

import { FadqExpansionPanelModule } from './expansion-panel/expansion-panel.module';
import { FadqToastPanelModule } from './toast-panel/toast-panel.module';
import { FadqSidenavModule } from './sidenav/sidenav.module';


@NgModule({
  imports: [
    FadqExpansionPanelModule,
    FadqToastPanelModule,
    FadqSidenavModule
  ],
  exports: [
    FadqExpansionPanelModule,
    FadqToastPanelModule,
    FadqSidenavModule
  ]
})
export class FadqPortalModule {}
