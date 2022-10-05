import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { IgoLanguageModule } from '@igo2/core';

import { TOOL_CONFIG } from 'src/lib/core/core.module';

import { HelpToolComponent } from './help-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    IgoLanguageModule
  ],
  declarations: [HelpToolComponent],
  exports: [HelpToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: TOOL_CONFIG,
      useValue: {
        name: 'help',
        title: 'tools.help',
        icon: 'information',
        component: HelpToolComponent
      },
      multi: true
    },
  ]
})
export class FadqHelpToolModule {}
