import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ToolComponent } from '@igo2/common';

import {
  Client,
  ClientRef,
  ClientController,
  ClientService
} from 'src/lib/client';

import { ClientState } from '../client.state';

/**
 * Tool to display a list of clients
 */
@ToolComponent({
  name: 'clientList',
  title: 'tools.clientList',
  icon: 'account-multiple-plus'
})
@Component({
  selector: 'fadq-client-list-tool',
  templateUrl: './client-list-tool.component.html',
  styleUrls: ['./client-list-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientListToolComponent implements OnInit, OnDestroy {

  clients$: BehaviorSubject<ClientRef[]> = new BehaviorSubject([]);

  private activeClients$$: Subscription;

  constructor(
    private clientService: ClientService,
    private clientState: ClientState,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // TODO: disabled when a widget is active
    this.clientService.getClients()
      .subscribe((clients: ClientRef[]) => this.clients$.next(clients));

    this.activeClients$$ = this.clientState.controllerStore.entities$
       .subscribe((controller: ClientController[]) => { this.cdRef.detectChanges(); });
  }

  ngOnDestroy() {
    this.activeClients$$.unsubscribe();
  }

  onClientAddedChange(event: {added: boolean, client: ClientRef}) {
    if (event.added === true) {
      this.clientState.getClientByNum(event.client.info.numero)
        .subscribe((client: Client) => this.clientState.addClient(client));
    } else {
      this.clientState.clearClientByNum(event.client.info.numero);
    }
  }

  clientIsAdded(client: ClientRef): boolean {
    const controller = this.clientState.controllerStore.get(client.info.numero);
    return controller !== undefined;
  }

}
