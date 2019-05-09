import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { EntityRecord, EntityStore, EntityTransaction } from '@igo2/common';
import { IgoMap } from '@igo2/geo';
import { EditionState, MapState } from '@igo2/integration';

import {
  Client,
  ClientService,
  ClientParcelYear,
  ClientParcelYearService
} from 'src/lib/client';

import { ClientWorkspace } from './shared/client-workspace';
import { ClientWorkspaceService } from './shared/client-workspace.service';

/**
 * Service that holds the state of the client module
 */
@Injectable({
  providedIn: 'root'
})
export class ClientState implements OnDestroy {

  /** Observable of the current workspace, if any */
  readonly workspace$ = new BehaviorSubject<ClientWorkspace>(undefined);

  readonly resolution$ = new Subject<{confirm: () => void; abort?: () => void;}>();

  /** Observable of the client error, if any */
  readonly clientError$ = new BehaviorSubject<string>(undefined);

  private parcelYear: ClientParcelYear;
  
  private parcelYear$$: Subscription;

  get map(): IgoMap { return this.mapState.map; }

  get transaction(): EntityTransaction {
    return this.workspace ? this.workspace.transaction : undefined;
  }

  /** Store that holds all the "parcel years". This is not on a per client basis. */
  get parcelYearStore(): EntityStore<ClientParcelYear> { return this._parcelYearStore; }
  _parcelYearStore: EntityStore<ClientParcelYear>;

  /** Current client workspace */
  get workspace(): ClientWorkspace { return this.workspace$.value; }

  constructor(
    private mapState: MapState,
    private editionState: EditionState,
    private clientService: ClientService,
    private clientParcelYearService: ClientParcelYearService,
    private clientWorkspaceService: ClientWorkspaceService
  ) {
    this.initParcelYears();
  }

  ngOnDestroy() {
    this.clearClient();
    this.teardownParcelYears();
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

  getClientByNum(clientNum: string): Observable<Client> {
    const annee = this.parcelYear ? this.parcelYear.annee : undefined;
    return this.clientService.getClientByNum(clientNum, annee);
  }

  setClient(client: Client | undefined) {
    if (this.transaction !== undefined && !this.transaction.empty) {
      this.resolution$.next({confirm: () => this.setClient(client)});
      return;
    }

    this.clearClient();

    if (client === undefined) {
      return;
    }

    const workspace = this.clientWorkspaceService.createClientWorkspace(client, this.map);

    this.editionState.register(workspace.parcelEditor);
    this.editionState.register(workspace.schemaEditor);
    this.editionState.setEditor(workspace.parcelEditor);

    if (client.parcels.length === 0) {
      this.clientError$.next('client.error.noparcel');
    } else {
      this.clientError$.next(undefined);
    }

    this.workspace$.next(workspace);
  }

  setClientNotFound() {
    if (!this.transaction.empty) {
      this.resolution$.next({confirm: () => this.setClientNotFound()});
      return;
    }
    this.clearClient();
    this.clientError$.next('client.error.notfound');
  }

  private clearClient() {
    this.clientError$.next(undefined);

    if (this.workspace === undefined) { return; }

    const workspace = this.workspace;

    this.editionState.unregister(workspace.parcelEditor);
    this.editionState.unregister(workspace.schemaEditor);

    workspace.destroy();
    this.workspace$.next(undefined);
  }

  private onSelectParcelYear(parcelYear: ClientParcelYear) {
    this.parcelYear = parcelYear;
    if (this.workspace !== undefined) {
      this.getClientByNum(this.workspace.client.info.numero)
        .subscribe((client?: Client) => this.setClient(client));
    }
  }
  /*
  private onSelectSchema(schema: ClientSchema) {
    if (schema !== undefined && this.schema !== undefined && schema.id === this.schema.id) {
      return;
    }
    this.setSchema(schema);
  }

  private setSchema(schema: ClientSchema) {
    if (!this.transaction.empty) {
      this.resolve$.next({
        confirm: () => this.setSchema(schema),
        abort: () => this.schemaStore.state.update(this.schema, {selected: true}, true)
      });
      return;
    }

    this.clearSchema();

    if (schema === undefined) { return; }

    this.parcelStore.state.updateAll({selected: false});
    this.elementState.setSchema(schema);

    this.editionState.store.register(this.elementState.editor);
    this.editionState.store.activateEditor(this.schemaState.editor);

    this.schema$.next(schema);
  }

  private clearSchema() {
    if (this.schema === undefined) { return; }

    this.elementState.setSchema(undefined);
    this.editionState.store.unregister(this.elementState.editor);
    this.editionState.store.activateEditor(this.schemaState.editor);

    this.schema$.next(undefined);
  }*/

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

}
