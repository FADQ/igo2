import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core/language';
import { IgoEntitySelectorModule } from '@igo2/common/entity';

import { ClientParcelDiagramSelectorComponent } from './client-parcel-diagram-selector.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoEntitySelectorModule
  ],
  exports: [ClientParcelDiagramSelectorComponent],
  declarations: [ClientParcelDiagramSelectorComponent]
})
export class FadqLibClientParcelDiagramSelectorModule {}
