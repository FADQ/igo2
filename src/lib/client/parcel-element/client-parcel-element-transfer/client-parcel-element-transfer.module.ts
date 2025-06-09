import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { IgoLanguageModule } from '@igo2/core/language';
import { IgoFormModule } from '@igo2/common/form';
import { IgoEntitySelectorModule } from '@igo2/common/entity';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { ClientParcelElementTransferComponent } from './client-parcel-element-transfer.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    IgoLanguageModule,
    IgoFormModule,
    IgoEntitySelectorModule,
    FadqLibCardPanelModule
  ],
  exports: [
    ClientParcelElementTransferComponent
  ],
  declarations: [
    ClientParcelElementTransferComponent
  ],
})
export class FadqLibClientParcelElementTransferModule {}
