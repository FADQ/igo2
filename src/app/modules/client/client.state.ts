import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable, BehaviorSubject, Subscription, zip } from 'rxjs';
import { skip, map } from 'rxjs/operators';

import { EntityRecord, EntityStore,  Editor } from '@igo2/common';
import { EditionState } from '@igo2/integration';

import {
  Client,
  ClientService,
  ClientParcel,
  ClientParcelYear,
  ClientParcelYearService,
  ClientSchemaElement,
  generateParcelColor
} from 'src/lib/client';

import { ClientWorkspace } from './shared/client-workspace';
import { ClientWorkspaceService } from './shared/client-workspace.service';
import { ClientResolutionService } from './shared/client-resolution.service';
import { FeatureStoreSelectionStrategy } from '@igo2/geo';

/**
 * Service that holds the state of the client module
 */
@Injectable({
  providedIn: 'root'
})
export class ClientState implements OnDestroy {

  /** Observable of the current workspace */
  get workspaceStore(): EntityStore<ClientWorkspace> { return this._workspaceStore; }
  _workspaceStore: EntityStore<ClientWorkspace>;

  /** Observable of a message or error */
  readonly message$ = new BehaviorSubject<string>(undefined);

  /** Current parcel year */
  private parcelYear: ClientParcelYear;

  /** Subscription to the parcel year changes */
  private parcelYear$$: Subscription;

  /** Subscription to the workspaces changes */
  private workspaces$$: Subscription;

  /** Store that holds all the "parcel years". This is not on a per client basis. */
  get parcelYearStore(): EntityStore<ClientParcelYear> { return this._parcelYearStore; }
  _parcelYearStore: EntityStore<ClientParcelYear>;

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
    this.initWorkspaces();
  }

  ngOnDestroy() {
    this.teardownWorkspaces();
    this.teardownParcelYears();
  }

  getClientByNum(clientNum: string): Observable<Client> {
    const annee = this.parcelYear ? this.parcelYear.annee : undefined;
    return this.clientService.getClientByNum(clientNum, annee);
  }

  addClient(client: Client | undefined) {
    this.setClientNotFound(false);

    const currentWorkspace = this.workspaceStore.get(client.info.numero);
    if (currentWorkspace !== undefined) {
      return;
    }

    const workspace = this.clientWorkspaceService.createClientWorkspace(client, {
      // moveToParcels: this.shouldMoveToParcels()
    });
    this.workspaceStore.insert(workspace);
  }

  setClientNotFound(notFound: boolean) {
    if (notFound === true) {
      this.message$.next('client.error.notfound');
    } else {
      this.message$.next(undefined);
    }
  }

  clearClient(client: Client) {
    const workspace = this.workspaceStore.get(client.info.numero);
    if (!workspace.transaction.empty) {
      this.clientResolutionService.enqueue({
        proceed: () => this.clearClient(client),
        workspace
      });
      return;
    }

    workspace.destroy();
    this.workspaceStore.delete(workspace);
  }

  private initWorkspaces() {
    this._workspaceStore = new EntityStore<ClientWorkspace>([], {
      getKey: (workspace: ClientWorkspace) => workspace.client.info.numero
    });

    this.workspaces$$ = this.workspaceStore.entities$
      .subscribe((workspaces: ClientWorkspace[]) => this.updateWorkspacesColor());
  }

  private teardownWorkspaces() {
    this.workspaces$$.unsubscribe();
    this.workspaceStore.all().forEach((workspace: ClientWorkspace) => workspace.destroy());
    this.workspaceStore.clear();
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

    const clients$ = this.workspaceStore.all().map((workspace: ClientWorkspace) => {
      return this.getClientByNum(workspace.client.info.numero);
    });

    zip(...clients$).subscribe((clients: Client[]) => {
      clients.forEach((client: Client) => {
        const workspace = this.workspaceStore.get(client.info.numero);
        workspace.parcelStore.load(client.parcels, false);
      });
    });
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

  private updateWorkspacesColor() {
    if (this.workspaceStore.count === 1) {
      const workspace = this.workspaceStore.all()[0];
      if (workspace.color !== undefined) {
        workspace.setColor(undefined);
      }
      return;
    }

    this.workspaceStore.all().forEach((workspace: ClientWorkspace, index: number) => {
      if (workspace.color === undefined) {
        const color = generateParcelColor(index);
        workspace.setColor(color);
      }
    });
  }

  private shouldMoveToParcels(): boolean {
    for (const workspace of this.workspaceStore.all()) {
      const selectedParcel = workspace.parcelStore.stateView
        .firstBy((record: EntityRecord<ClientParcel>) => record.state.selected === true);
      if (selectedParcel !== undefined) {
        return false;
      }

      const selectedElement = workspace.schemaElementStore.stateView
        .firstBy((record: EntityRecord<ClientSchemaElement>) => record.state.selected === true);
      if (selectedElement !== undefined) {
        return false;
      }
    }

    return true;
  }
}
