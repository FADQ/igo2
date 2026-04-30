import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { FadqLibAddressModule } from 'src/lib/address/address.module';
import { AddressEditorToolComponent } from './address-editor-tool.component';

import { TOOL_CONFIG } from 'src/lib/core/core.module';

/**
 * @ignore
 */
@NgModule({
  imports: [ FadqLibAddressModule ],
  declarations: [ AddressEditorToolComponent ],
  exports: [ AddressEditorToolComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: TOOL_CONFIG,
      useValue: {
        name: 'addressEditor',
        title: 'tools.addressEditor',
        icon: 'home-map-marker',
        component: AddressEditorToolComponent
      },
      multi: true
    },
  ]
})
export class FadqAddressEditorToolModule {}
