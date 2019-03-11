import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IgoMap } from 'src/lib/map';
import { MapState } from 'src/app/modules/map/map.state';

import { ToolComponent } from '@igo2/common';

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

<<<<<<< Updated upstream
  constructor() {}

=======
  /**
   * Map to edit on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }
  constructor(
    private mapState: MapState
  ) {}
>>>>>>> Stashed changes
}
