import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core/language';
import { IgoEntitySelectorModule } from '@igo2/common/entity';

import { ClientParcelYearSelectorComponent } from './client-parcel-year-selector.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoEntitySelectorModule,
    IgoLanguageModule
  ],
  exports: [ClientParcelYearSelectorComponent],
  declarations: [ClientParcelYearSelectorComponent]
})
export class FadqLibClientParcelYearSelectorModule {}
