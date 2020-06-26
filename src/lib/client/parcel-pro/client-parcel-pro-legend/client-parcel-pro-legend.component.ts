import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { ClientParcelProGroup } from '../shared/client-parcel-pro.interfaces';

@Component({
  selector: 'fadq-client-parcel-pro-legend',
  templateUrl: './client-parcel-pro-legend.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelProLegendComponent {

  @Input() groups: ClientParcelProGroup[];

  getGroupOuterColor(group: ClientParcelProGroup): string {
    return 'rgb(' + group.color.join(', ') + ')';
  }

  getGroupInnerColor(group: ClientParcelProGroup): string {
    return 'rgba(' + group.color.join(', ') + ', 0.15)';
  }

  constructor() {}

}
