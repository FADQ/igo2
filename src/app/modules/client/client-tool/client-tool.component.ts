import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ToolComponent, EntityStore } from '@igo2/common';

import {
  Client,
  ClientParcelYear,
  ClientInfoService
} from 'src/lib/client';

import { ClientState } from '../client.state';
import { ClientWorkspace } from '../shared/client-workspace';

/**
 * Tool to display a client's info
 */
@ToolComponent({
  name: 'client',
  title: 'tools.client',
  icon: 'person'
})
@Component({
  selector: 'fadq-client-tool',
  templateUrl: './client-tool.component.html',
  styleUrls: ['./client-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientToolComponent {

  /**
   * Observable of the active client
   * @internal
   */
  get workspace$(): BehaviorSubject<ClientWorkspace> { return this.clientState.workspace$; }

  /**
   * Observable of the client error, if any
   * @internal
   */
  get message$(): BehaviorSubject<string> { return this.clientState.message$; }

  /**
   * Store holding all the avaiables "parcel years"
   * @internal
   */
  get parcelYearStore(): EntityStore<ClientParcelYear> {
    return this.clientState.parcelYearStore;
  }

  constructor(
    private clientInfoService: ClientInfoService,
    private clientState: ClientState
  ) {}

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
