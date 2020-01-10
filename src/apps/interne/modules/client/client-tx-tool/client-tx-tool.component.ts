import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { MatDialog } from '@angular/material';

import { BehaviorSubject, Subscription } from 'rxjs';

import { EntityStore, ToolComponent } from '@igo2/common';

import {
  Client,
  ClientService,
  ClientParcelYear,
  ClientController,
  ClientParcelElementTxService,
  ClientParcelElementDeleteTxDialogComponent
} from 'src/lib/client';

import { ClientState } from '../client.state';

/**
 * Tool to display a list of clients with an associated tx
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

  /**
   * Client store
   */
  readonly clients: EntityStore<Client> = new EntityStore([], {
    getKey: (client: Client) => client.info.numero
  });

  /**
   * Subscription to the number of active clients. Useful to
   * update the add/clear buttons
   */
  private activeClients$$: Subscription;

  /**
   * Subscription to the parcel year. Useful to refresh the list of clients
   * with an associated tx
   */
  private parcelYear$$: Subscription;

  /**
   * Store holding all the availables "parcel years"
   * @internal
   */
  get parcelYears(): EntityStore<ClientParcelYear> {
    return this.clientState.parcelYears;
  }

  /**
   * Observable of the parcel year selector state
   * @internal
   */
  get parcelYearSelectorDisabled$(): BehaviorSubject<boolean> {
    return this.clientState.parcelElementTxOngoing$;
  }

  constructor(
    private clientService: ClientService,
    private clientParcelElementTxService: ClientParcelElementTxService,
    private clientState: ClientState,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * Subscribe to the parcel year and the number of clients. Load
   * initial data.
   * @internal
   */
  ngOnInit() {
    this.clients.view.sort({
      valueAccessor: (client: Client) => client.tx.date,
      direction: 'desc'
    });

    this.parcelYear$$ = this.clientState.parcelYear$
      .subscribe((parcelYear: ClientParcelYear) => this.clients.view.filter(
        (client: Client) => client.tx.annee === parcelYear.annee
      ));

    this.clientParcelElementTxService.getClientsInTx()
      .subscribe((clients: Client[]) => this.clients.load(clients));

    this.activeClients$$ = this.clientState.controllers.count$
      .subscribe((count: number) => {
        this.cdRef.detectChanges();
      });
  }

  /**
   * Clear subscriptions
   * @internal
   */
  ngOnDestroy() {
    this.activeClients$$.unsubscribe();
    this.parcelYear$$.unsubscribe();
  }

  /**
   * When a client is added, find it and activate it like it was searched.
   * @param event Added event
   * @internal
   */
  onClientAddedChange(event: {added: boolean, client: Client}) {
    const clientNum = event.client.info.numero;
    if (event.added === true) {
      this.clientService.getClientByNum(clientNum).subscribe((client: Client) => {
        this.clientState.setClientNotFound(false);
        this.clientState.addClient(client);
      });
    } else {
      this.clientState.clearClientByNum(clientNum);
    }

    this.cdRef.detectChanges();
  }

  /**
   * When the delete button is clicked, open the delete tx dialog.
   * @return client Client
   * @internal
   */
  onDeleteTx(client: Client) {
    const controller = this.clientState.controllers.get(client.info.numero);
    const data = {
      store: this.clients,
      client: client,
      annee: this.clientState.parcelYear$.value.annee,
      controller: controller
    };
    this.dialog.open(ClientParcelElementDeleteTxDialogComponent, {data});
  }

  /**
   * Check if a client is already added
   * @return Whther a client is added
   * @internal
   */
  clientIsAdded(client: Client): boolean {
    const controller = this.clientState.controllers.get(client.info.numero);
    return controller !== undefined;
  }
}
