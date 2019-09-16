import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { MatDialog } from '@angular/material';

import { Subscription } from 'rxjs';

import { EntityStore, ToolComponent } from '@igo2/common';

import {
  Client,
  ClientController,
  ClientParcelElementTxService,
  ClientParcelElementDeleteTxDialogComponent
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

  readonly clients: EntityStore<Client> = new EntityStore([], {
    getKey: (client: Client) => client.info.numero
  });

  private activeClients$$: Subscription;

  private parcelYear$$: Subscription;

  constructor(
    private clientParcelElementTxService: ClientParcelElementTxService,
    private clientState: ClientState,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clients.view.sort({
      valueAccessor: (client: Client) => client.tx.date,
      direction: 'desc'
    });

    this.parcelYear$$ = this.clientState.parcelYear$
      .subscribe((parcelYear: number) => this.clients.view.filter(
        (client: Client) => client.tx.annee === parcelYear
      ));

    this.clientParcelElementTxService.getClientsInTx()
      .subscribe((clients: Client[]) => this.clients.load(clients));

    this.activeClients$$ = this.clientState.controllers.entities$
      .subscribe((controller: ClientController[]) => { this.cdRef.detectChanges(); });
  }

  ngOnDestroy() {
    this.activeClients$$.unsubscribe();
    this.parcelYear$$.unsubscribe();
  }

  onClientAddedChange(event: {added: boolean, client: Client}) {
    const clientNum = event.client.info.numero;
    if (event.added === true) {
      this.clientState.getClientByNum(clientNum)
        .subscribe((client: Client) => this.clientState.addClient(client));
    } else {
      this.clientState.clearClientByNum(clientNum);
    }
    this.cdRef.detectChanges();
  }

  clientIsAdded(client: Client): boolean {
    const controller = this.clientState.controllers.get(client.info.numero);
    return controller !== undefined;
  }

  onDeleteTx(client: Client) {
    const controller = this.clientState.controllers.get(client.info.numero);
    const data = {
      store: this.clients,
      client: client,
      annee: this.clientState.parcelYear$.value,
      controller: controller
    };
    this.dialog.open(ClientParcelElementDeleteTxDialogComponent, {data});
  }

}
