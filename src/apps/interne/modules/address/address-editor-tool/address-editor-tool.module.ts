import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ToolService } from '@igo2/common';

import { FadqLibAddressModule } from 'src/lib/address/address.module';
import { AddressEditorToolComponent } from './address-editor-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [ FadqLibAddressModule ],
  declarations: [ AddressEditorToolComponent ],
  exports: [ AddressEditorToolComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FadqAddressEditorToolModule {}

ToolService.register({
  name: 'addressEditor',
  title: 'tools.addressEditor',
  icon: 'home-map-marker',
  component: AddressEditorToolComponent
});
