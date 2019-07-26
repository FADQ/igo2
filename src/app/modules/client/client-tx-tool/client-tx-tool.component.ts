import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';

import { EntityStore, ToolComponent } from '@igo2/common';

import {
  Client,
  ClientInTx,
  ClientController,
  ClientParcelElementService
} from 'src/lib/client';

import { ClientState } from '../client.state';

/**
 * Tool to display a list of clients
 */
@ToolComponent({
  name: 'clientTx',
  title: 'tools.clientTx',
  icon: 'account-multiple-plus'
})
@Component({
  selector: 'fadq-client-tx-tool',
  templateUrl: './client-tx-tool.component.html',
  styleUrls: ['./client-tx-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientTxToolComponent implements OnInit, OnDestroy {

  clients: EntityStore<ClientInTx> = new EntityStore([], {
    getKey: (client: ClientInTx) => client.noClient
  });

  private activeClients$$: Subscription;

  private parcelYear$$: Subscription;

  constructor(
    private clientParcelElementService: ClientParcelElementService,
    private clientState: ClientState,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clients.view.sort({
      valueAccessor: (client: ClientInTx) => client.dateCreation.date,
      direction: 'desc'
    });

    this.parcelYear$$ = this.clientState.parcelYear$
      .subscribe((parcelYear: number) => this.clients.view.filter(
        (client: ClientInTx) => client.annee === parcelYear
      ));

    this.clientParcelElementService.getClientsInTx()
      .subscribe((clients: ClientInTx[]) => this.clients.load(clients));

    this.activeClients$$ = this.clientState.controllerStore.entities$
      .subscribe((controller: ClientController[]) => { this.cdRef.detectChanges(); });
  }

  ngOnDestroy() {
    this.activeClients$$.unsubscribe();
    this.parcelYear$$.unsubscribe();
  }

  onClientAddedChange(event: {added: boolean, client: ClientInTx}) {
    const clientNum = event.client.noClient;
    if (event.added === true) {
      this.clientState.getClientByNum(clientNum)
        .subscribe((client: Client) => this.clientState.addClient(client));
    } else {
      this.clientState.clearClientByNum(clientNum);
    }
    this.cdRef.detectChanges();
  }

  clientIsAdded(client: ClientInTx): boolean {
    const controller = this.clientState.controllerStore.get(client.noClient);
    return controller !== undefined;
  }

}
