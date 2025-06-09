import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { IgoLanguageModule } from '@igo2/core/language';
import { IgoEntityTableModule } from '@igo2/common/entity';
import { IgoFormModule } from '@igo2/common/form';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { EditionSaveComponent } from './edition-save.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule,
    IgoEntityTableModule,
    FadqLibCardPanelModule
  ],
  exports: [
    EditionSaveComponent
  ],
  declarations: [
    EditionSaveComponent
  ],
})
export class FadqLibEditionSaveModule {}
