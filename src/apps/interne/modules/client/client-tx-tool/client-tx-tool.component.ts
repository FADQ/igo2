import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { MatDialog } from '@angular/material';

import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';

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

  private parcelElementTx$$: Subscription;

  readonly parcelYearSelectorDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private parcelYear$$: Subscription;

  /**
   * Observable of the active client
   * @internal
   */
  get controllers(): EntityStore<ClientController> { return this.clientState.controllers; }

  /**
   * Store holding all the avaiables "parcel years"
   * @internal
   */
  get parcelYearStore(): EntityStore<ClientParcelYear> {
    return this.clientState.parcelYearStore;
  }

  constructor(
    private clientService: ClientService,
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
      .subscribe((parcelYear: ClientParcelYear) => this.clients.view.filter(
        (client: Client) => client.tx.annee === parcelYear.annee
      ));

    this.clientParcelElementTxService.getClientsInTx()
      .subscribe((clients: Client[]) => this.clients.load(clients));

    this.activeClients$$ = this.controllers.count$
      .subscribe((count: number) => {
        this.cdRef.detectChanges();
        this.watchParcelElementTx();
      });
  }

  ngOnDestroy() {
    this.unwatchParcelElementTx();
    this.activeClients$$.unsubscribe();
    this.parcelYear$$.unsubscribe();
  }

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

  clientIsAdded(client: Client): boolean {
    const controller = this.clientState.controllers.get(client.info.numero);
    return controller !== undefined;
  }

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

  private watchParcelElementTx() {
    this.unwatchParcelElementTx();
    const parcelElementsActives$ = this.controllers.all().map((controller: ClientController) => {
      return controller.parcelElementsActive$;
    });

    this.parcelElementTx$$ = combineLatest(...parcelElementsActives$).subscribe((bunch: boolean[]) => {
      const noTxActive = bunch.every((active: boolean) => active === false);
      this.parcelYearSelectorDisabled$.next(!noTxActive);
    });
  }

  private unwatchParcelElementTx() {
    if (this.parcelElementTx$$ !== undefined) {
      this.parcelElementTx$$.unsubscribe();
      this.parcelElementTx$$ = undefined;
    }
  }

}
