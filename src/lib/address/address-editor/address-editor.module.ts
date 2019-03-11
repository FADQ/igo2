import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { AddressEditorComponent } from './address-editor.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    IgoLanguageModule
  ],
  declarations: [
    AddressEditorComponent
  ],
  exports: [
    AddressEditorComponent
  ]
})
export class FadqLibAddressEditorModule {}
