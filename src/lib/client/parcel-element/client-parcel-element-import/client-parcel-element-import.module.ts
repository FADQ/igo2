import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { FadqLibEditionModule } from '../../../edition/edition.module';

import { ClientParcelElementImportComponent } from './client-parcel-element-import.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoFormModule,
    FadqLibEditionModule
  ],
  exports: [
    ClientParcelElementImportComponent
  ],
  declarations: [
    ClientParcelElementImportComponent
  ],
})
export class FadqLibClientParcelElementImportModule {}
