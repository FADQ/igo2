import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ToolComponent } from '@igo2/common';

/**
 * Tool to edit addresses from Adresse Quebec.
 */
@ToolComponent({
  name: 'addressEditor',
  title: 'tools.addressEditor',
  icon: 'edit_location'
})
@Component({
  selector: 'fadq-address-editor-tool',
  templateUrl: './address-editor-tool.component.html',
  styleUrls: ['./address-editor-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressEditorToolComponent {

  constructor() {}

}
