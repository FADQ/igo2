import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { IgoActionModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { ContextualMenuComponent } from './contextual-menu.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    IgoActionModule,
    IgoLanguageModule
  ],
  declarations: [ContextualMenuComponent],
  exports: [ContextualMenuComponent],
})
export class FadqContextualMenuModule {}
