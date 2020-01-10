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
 * Service that holds the state of the client module. It handles everything
 * not specific to a single client and holds a reference to all the current clients.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientState implements OnDestroy {

  /** Active widget observable. Only one may be active for all clients */
  readonly activeWidget$: BehaviorSubject<Widget> = new BehaviorSubject(undefined);

  /** The current client's controller */
  get controller(): ClientController { return this.controller$.value; }
  readonly controller$: BehaviorSubject<ClientController> = new BehaviorSubject(undefined);

  /** Current parcel year */
  readonly parcelYear$: BehaviorSubject<ClientParcelYear> = new BehaviorSubject(undefined);
  get parcelYear(): ClientParcelYear { return this.parcelYear$.value; }

  /** Subscription to the parcel year changes */
  private parcelYear$$: Subscription;

  /** Store that holds all the "parcel years". Again, this is not on a per client basis. */
  get parcelYears(): EntityStore<ClientParcelYear> { return this._parcelYears; }
  _parcelYears: EntityStore<ClientParcelYear>;

  constructor(
    private clientService: ClientService,
    private clientParcelYearService: ClientParcelYearService,
    private clientControllerService: ClientControllerService
  ) {
    this.initParcelYears();
    this.loadParcelYears();

    this.clientService.getClientByNum('1560').subscribe((client: Client) => {
      this.setClient(client);
    });
  }

  /**
   * Teardown the client's controller and the parcel store
   * @internal
   */
  ngOnDestroy() {
    this.teardownController();
    this.teardownParcelYears();
  }

  /**
   * Create the client's controller
   * @param client Client
   */
  private setClient(client: Client) {
    const controller = this.clientControllerService.createClientController(client, {
      parcelYear: this.parcelYear
    });
    this.controller$.next(controller);
  }

  /**
   * Teardown the client's controller
   * @param client Client
   */
  private teardownController() {
    this.controller.destroy();
  }

  /**
   * Initialize the parcel year store and observe the selected parcel year
   */
  private initParcelYears() {
    this._parcelYears = new EntityStore<ClientParcelYear>([]);
    this._parcelYears.view.sort({
      valueAccessor: (year: ClientParcelYear) => year.annee,
      direction: 'desc'
    });

    this.parcelYear$$ = this.parcelYears.stateView
      .firstBy$((record: EntityRecord<ClientParcelYear>) => record.state.selected === true)
      .pipe(skip(1))
      .subscribe((record: EntityRecord<ClientParcelYear>) => {
        const parcelYear = record ? record.entity : undefined;
        this.onSelectParcelYear(parcelYear);
      });
  }

  /**
   * Teardown the parcel years store and the selected parcel year observer
   */
  private teardownParcelYears() {
    this.parcelYear$$.unsubscribe();
    this.parcelYears.clear();
  }

  /**
   * When a parcel year is selected, update the controller's parcel year (and it's parcels)
   * @param Parcel year
   */
  private onSelectParcelYear(parcelYear: ClientParcelYear) {
    this.parcelYear$.next(parcelYear);
    if (this.controller !== undefined) {
      this.controller.setParcelYear(this.parcelYear);
    }
  }

  /**
   * Fetch parcel years via a service then load them into the store. Also,
   * select the current parcel year as selected
   */
  private loadParcelYears() {
    this.clientParcelYearService.getParcelYears()
      .subscribe((parcelYears: ClientParcelYear[]) => {
        const current = parcelYears.find((parcelYear: ClientParcelYear) => {
          return parcelYear.current === true;
        });
        this.parcelYears.load(parcelYears);
        if (current !== undefined) {
          this.parcelYears.state.update(current, {selected: true});
        }
      });
  }
}
