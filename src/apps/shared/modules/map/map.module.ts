import { NgModule } from '@angular/core';

import { FadqLibMapModule } from 'src/lib/map/map.module';
import { FadqMapToolModule } from './map-tool/map-tool.module';
import { FadqContextualMenuModule } from './contextual-menu/contextual-menu.module';

@NgModule({
  imports: [
    FadqLibMapModule,
    FadqMapToolModule,
    FadqContextualMenuModule,
  ],
  exports: [
    FadqLibMapModule,
    FadqContextualMenuModule
  ],
  declarations: []
})
export class FadqMapModule {}
