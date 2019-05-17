import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntitySelectorModule } from '@igo2/common';

import { ClientWorkspaceSelectorComponent } from './client-workspace-selector.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoEntitySelectorModule
  ],
  exports: [ClientWorkspaceSelectorComponent],
  declarations: [ClientWorkspaceSelectorComponent]
})
export class FadqLibClientWorkspaceSelectorModule {}
