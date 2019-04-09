import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IgoMap, FeatureStore } from '@igo2/geo';
import { MapState } from '@igo2/integration';

import { ToolComponent } from '@igo2/common';
import { Address } from 'src/lib/address';

/**
 * Tool to edit addresses from Adresses Quebec.
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
  /**
   * Store Address
   * @internal
   */
  get store(): FeatureStore<Address> { return this.store; }

  /**
   * Map to edit on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }
  constructor(
    private mapState: MapState
  ) {}
}
