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

import { FadqLibAddressEditorModule } from 'src/lib/address/address-editor/address-editor.module';

import { AddressEditorToolComponent } from './address-editor-tool.component';

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
    IgoEntityTableModule,
    FadqLibAddressEditorModule
  ],
  declarations: [
    AddressEditorToolComponent
  ],
  exports: [
    AddressEditorToolComponent
  ],
  entryComponents: [
    AddressEditorToolComponent
  ]
})
export class FadqAddressEditorToolModule {}
