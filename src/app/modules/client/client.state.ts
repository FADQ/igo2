import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { EntityRecord, EntityStore, EntityTransaction, Editor } from '@igo2/common';
import { EditionState } from '@igo2/integration';

import {
  Client,
  ClientService,
  ClientParcelYear,
  ClientParcelYearService
} from 'src/lib/client';

import { ClientWorkspace } from './shared/client-workspace';
import { ClientWorkspaceService } from './shared/client-workspace.service';
import { ClientResolutionService } from './shared/client-resolution.service';
import { ClientSchemaConfirmDialogComponent } from './client-schema-confirm-dialog/client-schema-confirm-dialog.component';

/**
 * Service that holds the state of the client module
 */
@Injectable({
  providedIn: 'root'
})
export class ClientState implements OnDestroy {

  /** Observable of the current workspace */
  readonly workspace$ = new BehaviorSubject<ClientWorkspace>(undefined);

  /** Observable of a message or error */
  readonly message$ = new BehaviorSubject<string>(undefined);

  /** Current parcel year */
  private parcelYear: ClientParcelYear;

  /** Subscription to the parcel year changes */
  private parcelYear$$: Subscription;

  get transaction(): EntityTransaction {
    return this.workspace ? this.workspace.transaction : undefined;
  }

  /** Store that holds all the "parcel years". This is not on a per client basis. */
  get parcelYearStore(): EntityStore<ClientParcelYear> { return this._parcelYearStore; }
  _parcelYearStore: EntityStore<ClientParcelYear>;

  /** Current client workspace */
  get workspace(): ClientWorkspace { return this.workspace$.value; }

  constructor(
    private editionState: EditionState,
    private clientService: ClientService,
    private clientParcelYearService: ClientParcelYearService,
    private clientWorkspaceService: ClientWorkspaceService,
    private clientResolutionService: ClientResolutionService,
    private dialog: MatDialog
  ) {
    this.editionState.store.view.sort({
      valueAccessor: (editor: Editor) => editor.id,
      direction: 'asc'
    });

    this.initParcelYears();
  }

  ngOnDestroy() {
    this.clearClient();
    this.teardownParcelYears();
  }

  getClientByNum(clientNum: string): Observable<Client> {
    const annee = this.parcelYear ? this.parcelYear.annee : undefined;
    return this.clientService.getClientByNum(clientNum, annee);
  }

  setClient(client: Client | undefined) {
    if (this.transaction !== undefined && !this.transaction.empty) {
      this.clientResolutionService.enqueue({
        proceed: () => this.setClient(client),
        workspace: this.workspace
      });
      return;
    }

    this.clearClient();

    if (client === undefined) {
      return;
    }

    this.initClientWorkspace(client);
  }

  setClientNotFound() {
    if (!this.transaction.empty) {
      this.clientResolutionService.enqueue({
        proceed: () => this.setClientNotFound(),
        workspace: this.workspace
      });
      return;
    }
    this.clearClient();
    this.message$.next('client.error.notfound');
  }

  private initClientWorkspace(client: Client) {
    const workspace = this.clientWorkspaceService.createClientWorkspace(client);
    this.workspace$.next(workspace);
  }

  private destroyClientWorkspace() {
    if (this.workspace !== undefined) {
      this.workspace.destroy();
      this.workspace$.next(undefined);
    }
  }

  private clearClient() {
    this.message$.next(undefined);
    this.destroyClientWorkspace();
  }

  private initParcelYears() {
    this._parcelYearStore = new EntityStore<ClientParcelYear>([]);
    this._parcelYearStore.view.sort({
      valueAccessor: (year: ClientParcelYear) => year.annee,
      direction: 'desc'
    });

    this.loadParcelYears();

    this.parcelYear$$ = this.parcelYearStore.stateView
      .firstBy$((record: EntityRecord<ClientParcelYear>) => record.state.selected === true)
      .pipe(skip(1))
      .subscribe((record: EntityRecord<ClientParcelYear>) => {
        const parcelYear = record ? record.entity : undefined;
        this.onSelectParcelYear(parcelYear);
      });

  }

  private teardownParcelYears() {
    this.parcelYear$$.unsubscribe();
    this.parcelYearStore.clear();
  }

  private onSelectParcelYear(parcelYear: ClientParcelYear) {
    this.parcelYear = parcelYear;
    if (this.workspace !== undefined) {
      this.getClientByNum(this.workspace.client.info.numero)
        .subscribe((client?: Client) => this.setClient(client));
    }
  }

  /**
   * Load the parcel years
   */
  private loadParcelYears() {
    this.clientParcelYearService.getParcelYears()
      .subscribe((parcelYears: ClientParcelYear[]) => {
        const current = parcelYears.find((parcelYear: ClientParcelYear) => {
          return parcelYear.current === true;
        });
        this.parcelYearStore.load(parcelYears);
        if (current !== undefined) {
          this.parcelYearStore.state.update(current, {selected: true});
        }
      });
  }

  private openSchemaConfirmDialog(confirm: () => void, abort?: () => void): void {
    this.dialog.open(ClientSchemaConfirmDialogComponent, {
      data: {confirm, abort}
    });
  }

}
