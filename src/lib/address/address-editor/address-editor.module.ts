import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule } from '@igo2/common';

import { AddressEditorComponent } from './address-editor.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    IgoLanguageModule,
    IgoEntityTableModule
  ],
  declarations: [
    AddressEditorComponent
  ],
  exports: [
    AddressEditorComponent
  ]
})
export class FadqLibAddressEditorModule {}
