import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ToolService } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

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
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqHelpToolModule {}

ToolService.register({
  name: 'help',
  title: 'tools.help',
  icon: 'information',
  component: HelpToolComponent
});
