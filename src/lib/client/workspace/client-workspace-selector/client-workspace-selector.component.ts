import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { EntityStore } from '@igo2/common';

import { ClientWorkspace} from '../shared/client-workspace';

@Component({
  selector: 'fadq-client-workspace-selector',
  templateUrl: './client-workspace-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientWorkspaceSelectorComponent {

  @Input() store: EntityStore<ClientWorkspace>;

  @Output() selectedChange = new EventEmitter<{
    selected: boolean;
    entity: ClientWorkspace;
  }>();

  getClientNum(workspace: ClientWorkspace): string {
    return workspace.client.info.numero;
  }

}
