import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material';

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
  entryComponents: [HelpToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqHelpToolModule {}
