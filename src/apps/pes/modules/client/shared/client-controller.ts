import { BehaviorSubject, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EntityRecord, EntityStore } from '@igo2/common';
import { FeatureStore, IgoMap } from '@igo2/geo';

import {
  Client,
  ClientParcel,
  ClientParcelDiagram,
  ClientParcelWorkspace,
  ClientParcelService,
  getDiagramsFromParcels
} from 'src/lib/client';

export interface ClientControllerOptions {
  map: IgoMap;
  client: Client;
  parcelYear: number;
  parcelWorkspace: ClientParcelWorkspace;
  parcelService: ClientParcelService;
}

/**
 * This class handles things related to a specific client.
 * This is where workspaces (parcel, parcel element, schema, schema element)
 * are initialized. The controller handles some events (observables). Finally,
 * it holds a reference to client stuff used throughout the app.
 */
export class ClientController {

  /** Observable message  */
  readonly message$ = new BehaviorSubject<string>(undefined);

  /** Subscription to the selected diagram  */
  private diagram$$: Subscription;

  /** Subscription to the selected parcels  */
  private parcels$$: Subscription;

  /** Map */
  get map(): IgoMap { return this.options.map; }

  /** Active client */
  get client(): Client { return this.options.client; }

  get parcelYear(): number { return this._parcelYear || this.options.parcelYear; }
  private _parcelYear: number;

  /** Parcel workspace */
  get parcelWorkspace(): ClientParcelWorkspace {
    return this.options.parcelWorkspace;
  }

  /** Store that holds the parcels of the client */
  get parcelStore(): FeatureStore<ClientParcel> {
    return this.parcelWorkspace.parcelStore;
  }

  /** Selected parcels */
  get selectedParcels(): ClientParcel[] { return this.selectedParcels$.value; }
  readonly selectedParcels$: BehaviorSubject<ClientParcel[]> = new BehaviorSubject([]);

  /** Parcel service */
  get parcelService(): ClientParcelService {
    return this.options.parcelService;
  }

  /** Store that holds the diagrams of the client */
  get diagramStore(): EntityStore<ClientParcelDiagram> { return this._diagramStore; }
  private _diagramStore: EntityStore<ClientParcelDiagram>;

  constructor(private options: ClientControllerOptions) {
    this.initDiagrams();
    this.initParcels();

    if (options.parcelYear !== undefined) {
      this.setParcelYear(options.parcelYear);
    }
  }

  /**
   * Teardown diagram store and parcel workspace
   * @internal
   */
  destroy() {
    this.message$.next(undefined);
    this.teardownDiagrams();
    this.teardownParcels();
  }

  /**
   * Set the parcel year and load parcels of that year
   * @param parcelYear number
   */
  setParcelYear(parcelYear: number) {
    this._parcelYear = parcelYear;
    this.loadParcels();
  }

  /**
   * Initialize the diagram store and observe the selected diagrams
   * to filter the parcel store accordingly.
   */
  private initDiagrams() {
    this._diagramStore = new EntityStore<ClientParcelDiagram>([]);
    this.diagramStore.view.sort({
      valueAccessor: (diagram: ClientParcelDiagram) => diagram.id,
      direction: 'asc'
    });

    this.diagram$$ = this.diagramStore.stateView
      .manyBy$((record: EntityRecord<ClientParcelDiagram>) => record.state.selected === true)
      .subscribe((records: EntityRecord<ClientParcelDiagram>[]) => {
        const diagrams = records.map((record: EntityRecord<ClientParcelDiagram>) => record.entity);
        this.onSelectDiagrams(diagrams);
      });
  }

  /**
   * Load diagrams into the store and select them all
   * @param diagrams Diagrams
   */
  private loadDiagrams(diagrams: ClientParcelDiagram[]) {
    this.diagramStore.load(diagrams);
    this.diagramStore.state.updateMany(diagrams, {selected: true});
  }

  /**
   * Clear the diagram store and teardown observers
   * @param diagrams Diagrams
   */
  private teardownDiagrams() {
    this.diagram$$.unsubscribe();
    this.diagramStore.clear();
  }

  /**
   * Filter parcels by diagrams
   * @param diagrams Diagrams
   */
  private filterParcelsByDiagrams(diagrams: ClientParcelDiagram[]) {
    const diagramIds = diagrams.map((diagram: ClientParcelDiagram) => diagram.id);
    const filterClause = function(parcel: ClientParcel): boolean {
      const noDiagramme = parcel.properties.noDiagramme;
      return diagramIds.includes(noDiagramme);
    };
    this.parcelStore.view.filter(filterClause);
  }

  /**
   * When diagrams are selected, filter parcels
   * @param diagrams Selected diagrams
   */
  private onSelectDiagrams(diagrams: ClientParcelDiagram[]) {
    this.filterParcelsByDiagrams(diagrams);
  }

  /**
   * Initialize the parcel workspace and observe the selected parcels.
   * When parcels are selected, nothing happens here but other components
   * needs them.
   */
  private initParcels() {
    this.parcels$$ = this.parcelStore
      .stateView.manyBy$((record: EntityRecord<ClientParcel>) => record.state.selected === true)
      .subscribe((records: EntityRecord<ClientParcel>[]) => {
        this.onSelectParcels(records.map(record => record.entity));
      });

    this.parcelWorkspace.init();
  }

  /**
   * Fetch the parcels for the client and the current parcel year via a service
   * then load them into the store. If no parcels are found, set a message
   * to be displayed in the client tool.
   */
  private loadParcels() {
    this.parcelService.getParcels(this.client, this.parcelYear)
      .pipe(
        tap((parcels: ClientParcel[]) => {
          const diagrams = getDiagramsFromParcels(parcels);
          this.loadDiagrams(diagrams);
        })
      )
      .subscribe((parcels: ClientParcel[]) => {
        this.parcelWorkspace.load(parcels);

        if (parcels.length === 0) {
          this.message$.next('client.error.noparcel');
        } else {
          this.message$.next(undefined);
        }
      });
  }

  /**
   * Teardown the parcel workspace and the selected parcels observer
   */
  private teardownParcels() {
    if (this.parcels$$ !== undefined) {
      this.parcels$$.unsubscribe();
    }

    this.parcelWorkspace.teardown();
  }

  /**
   * Track selected parcels
   */
  private onSelectParcels(parcels: ClientParcel[]) {
    this.selectedParcels$.next(parcels);
  }

}
