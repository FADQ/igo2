import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Client, ClientController, ClientInfoService } from 'src/lib/client';

@Component({
  selector: 'fadq-client-tool-item',
  templateUrl: './client-tool-item.component.html',
  styleUrls: ['./client-tool-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientToolItemComponent {

  readonly showContent$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  @Input() controller: ClientController;

  @Input() showInfo: boolean = true;

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

  toggleContent(collapsed: boolean) {
    this.showContent$.next(!collapsed);
  }

  getLegendInnerColor(): string {
    return `rgba(${this.controller.color.join(',')}, 0.15)`;
  }

  getLegendOuterColor(): string {
    return `rgb(${this.controller.color.join(',')})`;
  }
}
