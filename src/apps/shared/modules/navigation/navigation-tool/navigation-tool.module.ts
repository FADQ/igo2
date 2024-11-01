import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

import { FadqLibPlaceSelectorModule } from 'src/lib/navigation/place-selector/place-selector.module';
import { FadqLibPoiSelectorModule } from 'src/lib/navigation/poi-selector/poi-selector.module';

import { NavigationToolComponent } from './navigation-tool.component';

import { TOOL_CONFIG } from 'src/lib/core/core.module';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatDividerModule,
    FadqLibPlaceSelectorModule,
    FadqLibPoiSelectorModule
  ],
  declarations: [NavigationToolComponent],
  exports: [NavigationToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: TOOL_CONFIG,
      useValue: {
        name: 'navigation',
        title: 'tools.navigation',
        icon: 'map-marker-radius',
        component: NavigationToolComponent
      },
      multi: true
    },
  ]
})
export class FadqNavigationToolModule {}
