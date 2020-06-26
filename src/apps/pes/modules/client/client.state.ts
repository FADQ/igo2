import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { EntityRecord, EntityStore,  Widget } from '@igo2/common';

import {
  Client,
  ClientParcelYear,
  ClientParcelYearService
} from 'src/lib/client';

import { ClientLoader } from 'src/apps/shared/client.loader';

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

  /** Subscription to the client loader. */
  private clientLoader$$: Subscription;

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
    private clientParcelYearService: ClientParcelYearService,
    private clientControllerService: ClientControllerService,
    private clientLoader: ClientLoader
  ) {
    this.initParcelYears();
    this.loadParcelYears();
    this.loadClient();
  }

  /**
   * Teardown the client's controller and the parcel store
   * @internal
   */
  ngOnDestroy() {
    if (this.clientLoader$$ !== undefined) {
      this.clientLoader$$.unsubscribe();
      this.clientLoader$$ = undefined;
    }

    this.teardownController();
    this.teardownParcelYears();
  }

  /**
   * Load the client from the URL or from the auth token.
   */
  private loadClient() {
    this.clientLoader$$ = this.clientLoader.loadClient().subscribe((client: Client) => {
      if (this.controller !== undefined) {
        this.teardownController();
      }
      if (client !== undefined) {
        this.setClient(client);
      }
    });
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
   * @param parcelYear Parcel year
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
