import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { ClientController } from '../shared/client-controller';

/**
 * Tool to display a client's info and addresses
 */
@Component({
  selector: 'fadq-client-tool-item',
  templateUrl: './client-tool-item.component.html',
  styleUrls: ['./client-tool-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientToolItemComponent {

  @Input() controller: ClientController;

  @Output() clickAddress = new EventEmitter<string>();

  constructor() {}

}
