import { NgModule } from '@angular/core';

import { FadqLibAddressEditorModule } from 'src/lib/address/address-editor/address-editor.module';

import { AddressEditorToolComponent } from './address-editor-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
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
