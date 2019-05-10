import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { ToolComponent } from '@igo2/common';

import { Client, ClientInfoService } from 'src/lib/client';

import { ClientWorkspace } from '../shared/client-workspace';

@Component({
  selector: 'fadq-client-tool-item',
  templateUrl: './client-tool-item.component.html',
  styleUrls: ['./client-tool-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientToolItemComponent {

  readonly showContent$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  @Input() workspace: ClientWorkspace;

  @Output() clear = new EventEmitter<ClientWorkspace>();

  constructor(
    private clientInfoService: ClientInfoService
  ) {}

  onClearButtonClick() {
    this.clear.emit(this.workspace);
  }

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
    return `rgba(${this.workspace.color.join(',')}, 0.15)`;
  }

  getLegendOuterColor(): string {
    return `rgb(${this.workspace.color.join(',')})`;
  }
}
