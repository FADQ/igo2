import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { Client, ClientController, ClientInfoService } from 'src/lib/client';

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

  constructor(private clientInfoService: ClientInfoService) {}

  /**
   * Open the client's info link into a new window
   * @internal
   * @param client Client
   */
  openClientInfoLink(client: Client) {
    const link = this.clientInfoService.getClientInfoLink(client.info.numero);
    window.open(link, 'Client', 'width=800, height=600');
    return false;
  }
}
