import { Injectable, OnDestroy } from '@angular/core';

import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { EntityRecord, EntityStore,  Widget, Workspace, WorkspaceStore } from '@igo2/common';

import {
  Client,
  ClientService,
  ClientParcelYear,
  ClientParcelYearService
} from 'src/lib/client';

import { ClientController } from './shared/client-controller';
import { ClientControllerService } from './shared/client-controller.service';

/**
 * Service that holds the state of the client module
 */
@Injectable({
  providedIn: 'root'
})
export class ClientState implements OnDestroy {

  readonly activeWidget$: BehaviorSubject<Widget> = new BehaviorSubject(undefined);

  get controller(): ClientController { return this.controller$.value; }
  readonly controller$: BehaviorSubject<ClientController> = new BehaviorSubject(undefined);

  /** Observable of a message or error */
  readonly message$ = new BehaviorSubject<string>(undefined);

  /** Current parcel year */
  readonly parcelYear$: BehaviorSubject<number> = new BehaviorSubject(undefined);
  get parcelYear(): number { return this.parcelYear$.value; }

  /** Subscription to the parcel year changes */
  private parcelYear$$: Subscription;

  /** Store that holds all the "parcel years". This is not on a per client basis. */
  get parcelYearStore(): EntityStore<ClientParcelYear> { return this._parcelYearStore; }
  _parcelYearStore: EntityStore<ClientParcelYear>;

  constructor(
    private clientService: ClientService,
    private clientParcelYearService: ClientParcelYearService,
    private clientControllerService: ClientControllerService
  ) {
    this.initParcelYears();
    this.getClientByNum('1560').subscribe((client: Client) => {
      this.setClient(client);
    });
  }

  /**
   * Store that holds all the available workspaces
   */
  get store(): WorkspaceStore { return this._store; }
  private _store: WorkspaceStore;

  ngOnDestroy() {
    this.teardownController();
    this.teardownParcelYears();
  }

  getClientByNum(clientNum: string): Observable<Client> {
    return this.clientService.getClientByNum(clientNum);
  }

  setClient(client: Client | undefined) {
    const controller = this.clientControllerService.createClientController(client, {
      parcelYear: this.parcelYear
    });
    this.controller$.next(controller);
  }

  private teardownController() {
    this.controller.destroy();
  }

  private initParcelYears() {
    this._parcelYearStore = new EntityStore<ClientParcelYear>([]);
    this._parcelYearStore.view.sort({
      valueAccessor: (year: ClientParcelYear) => year.annee,
      direction: 'desc'
    });

    this.parcelYear$$ = this.parcelYearStore.stateView
      .firstBy$((record: EntityRecord<ClientParcelYear>) => record.state.selected === true)
      .pipe(skip(1))
      .subscribe((record: EntityRecord<ClientParcelYear>) => {
        const parcelYear = record ? record.entity : undefined;
        this.onSelectParcelYear(parcelYear);
      });

    this.loadParcelYears();
  }

  private teardownParcelYears() {
    this.parcelYear$$.unsubscribe();
    this.parcelYearStore.clear();
  }

  private onSelectParcelYear(parcelYear: ClientParcelYear) {
    this.parcelYear$.next(parcelYear === undefined ? undefined : parcelYear.annee);
    if (this.controller !== undefined) {
      this.controller.setParcelYear(this.parcelYear);
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
}
