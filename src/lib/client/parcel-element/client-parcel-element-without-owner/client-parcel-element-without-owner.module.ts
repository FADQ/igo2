import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule } from '@igo2/common';

import { FadqLibCardPanelModule } from 'src/lib/misc/card-panel/card-panel.module';

import { ClientParcelElementWithoutOwnerComponent } from './client-parcel-element-without-owner.component';

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
    IgoEntityTableModule,
    FadqLibCardPanelModule
  ],
  exports: [
    ClientParcelElementWithoutOwnerComponent
  ],
  declarations: [
    ClientParcelElementWithoutOwnerComponent
  ],
  entryComponents: [
    ClientParcelElementWithoutOwnerComponent
  ]
})
export class FadqLibClientParcelElementWithoutOwnerModule {}
