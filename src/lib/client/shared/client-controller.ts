import { BehaviorSubject, Subscription } from 'rxjs';
import { concatMap, map, skip, tap } from 'rxjs/operators';

import { EntityRecord, EntityStore, EntityTransaction, WorkspaceStore } from '@igo2/common';
import { FeatureStore, IgoMap } from '@igo2/geo';

import { Client } from '../shared/client.interfaces';
import { ClientParcel, ClientParcelDiagram } from '../parcel/shared/client-parcel.interfaces';
import { ClientParcelWorkspace } from '../parcel/shared/client-parcel-workspace';
import { ClientParcelService } from '../parcel/shared/client-parcel.service';
import {
  createPerClientParcelLayerStyle,
  createParcelLayerStyle,
  getDiagramsFromParcels
} from '../parcel/shared/client-parcel.utils';
import { ClientParcelElementWorkspace } from '../parcel-element/shared/client-parcel-element-workspace';
import { ClientParcelElement } from '../parcel-element/shared/client-parcel-element.interfaces';
import { ClientParcelElementService } from '../parcel-element/shared/client-parcel-element.service';
import { ClientParcelElementTransactionService } from '../parcel-element/shared/client-parcel-element-transaction.service';
import {
  createParcelElementLayerStyle,
  getDiagramsFromParcelElements
} from '../parcel-element/shared/client-parcel-element.utils';
import { ClientSchema } from '../schema/shared/client-schema.interfaces';
import { ClientSchemaService } from '../schema/shared/client-schema.service';
import { ClientSchemaWorkspace } from '../schema/shared/client-schema-workspace';
import { ClientSchemaElement, ClientSchemaElementTypes } from '../schema-element/shared/client-schema-element.interfaces';
import { ClientSchemaElementWorkspace } from '../schema-element/shared/client-schema-element-workspace';
import { ClientSchemaElementService } from '../schema-element/shared/client-schema-element.service';
import { ClientSchemaElementTransactionService } from '../schema-element/shared/client-schema-element-transaction.service';
import { createSchemaElementLayerStyle } from '../schema-element/shared/client-schema-element.utils';

export interface ClientControllerOptions {
  map: IgoMap;
  client: Client;
  controllers: EntityStore<ClientController>;
  workspaceStore: WorkspaceStore;
  parcelYear: number;
  parcelWorkspace: ClientParcelWorkspace;
  parcelService: ClientParcelService;
  parcelElementWorkspace: ClientParcelElementWorkspace;
  parcelElementService: ClientParcelElementService;
  parcelElementTransactionService: ClientParcelElementTransactionService;
  schemaService: ClientSchemaService;
  schemaWorkspace: ClientSchemaWorkspace;
  schemaElementWorkspace: ClientSchemaElementWorkspace;
  schemaElementService: ClientSchemaElementService;
  schemaElementTransactionService: ClientSchemaElementTransactionService;
  color?: [number, number, number];
}

export class ClientController {

  readonly message$ = new BehaviorSubject<string>(undefined);

  /** Subscription to the selected diagram  */
  private diagram$$: Subscription;

  /** Subscription to the selected parcels  */
  private parcels$$: Subscription;

  /** Subscription to the selected parcel elements  */
  private parcelElements$$: Subscription;

  /** Subscription to the selected schema  */
  private schema$$: Subscription;

  /** Subscription to the selected schema element  */
  private schemaElements$$: Subscription;

  private currentStyle: 'single' | 'multi' = 'single';

  /** Map */
  get map(): IgoMap { return this.options.map; }

  /** Active client */
  get client(): Client { return this.options.client; }

  /** Controller store */
  get controllers(): EntityStore<ClientController> {
    return this.options.controllers;
  }

  /** Workspace store */
  get workspaceStore(): WorkspaceStore {
    return this.options.workspaceStore;
  }

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

  /** Active parcel element workspace */
  get parcelElementWorkspace(): ClientParcelElementWorkspace {
    return this.options.parcelElementWorkspace;
  }

  /** Store that holds the parcel elements */
  get parcelElementStore(): FeatureStore<ClientParcelElement> {
    return this.parcelElementWorkspace.parcelElementStore;
  }

  /** Selected parcel elements */
  get selectedParcelElements(): ClientParcelElement[] { return this.selectedParcelElements$.value; }
  readonly selectedParcelElements$: BehaviorSubject<ClientParcelElement[]> = new BehaviorSubject([]);

  /** Selected parcel elements */
  get activeParcelElement(): ClientParcelElement {
    return this.selectedParcelElements.length === 1 ? this.selectedParcelElements[0] : undefined;
  }

  /** Parcel element transaction */
  get parcelElementTransaction(): EntityTransaction { return this.parcelElementWorkspace.transaction; }

  /** Parcel element service */
  get parcelElementService(): ClientParcelElementService {
    return this.options.parcelElementService;
  }

  /** Parcel element transaction service */
  get parcelElementTransactionService(): ClientParcelElementTransactionService {
    return this.options.parcelElementTransactionService;
  }

  /** Whether parcel edition is active */
  get parcelElementsActive(): boolean { return this.parcelElementsActive$.value; }
  readonly parcelElementsActive$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /** Schema workspace */
  get schemaWorkspace(): ClientSchemaWorkspace {
    return this.options.schemaWorkspace;
  }

  /** Store that holds the schemas of the client */
  get schemaStore(): EntityStore<ClientSchema> {
    return this.schemaWorkspace.schemaStore;
  }

  /** Selected parcel elements */
  get schema(): ClientSchema { return this.schema$.value; }
  readonly schema$: BehaviorSubject<ClientSchema> = new BehaviorSubject(undefined);

  /** Schema service */
  get schemaService(): ClientSchemaService {
    return this.options.schemaService;
  }

  /** Active element workspace */
  get schemaElementWorkspace(): ClientSchemaElementWorkspace {
    return this.options.schemaElementWorkspace;
  }

  /** Store that holds the elements of the active schema */
  get schemaElementStore(): FeatureStore<ClientSchemaElement> {
    return this.schemaElementWorkspace.schemaElementStore;
  }

  /** Selected schema elements */
  get selectedSchemaElements(): ClientSchemaElement[] { return this.selectedSchemaElements$.value; }
  readonly selectedSchemaElements$: BehaviorSubject<ClientSchemaElement[]> = new BehaviorSubject([]);

  /** Selected schema elements */
  get activeSchemaElement(): ClientSchemaElement {
    return this.selectedSchemaElements.length === 1 ? this.selectedSchemaElements[0] : undefined;
  }

  /** Element transaction */
  get schemaElementTransaction(): EntityTransaction { return this.schemaElementWorkspace.transaction; }

  /** Schema element service */
  get schemaElementService(): ClientSchemaElementService {
    return this.options.schemaElementService;
  }

  /** Parcel element transaction service */
  get schemaElementTransactionService(): ClientSchemaElementTransactionService {
    return this.options.schemaElementTransactionService;
  }

  /** Store that holds the diagrams of the active client */
  get diagramStore(): EntityStore<ClientParcelDiagram> { return this._diagramStore; }
  private _diagramStore: EntityStore<ClientParcelDiagram>;

  /** Client parcel color */
  get parcelColor(): [number, number, number] { return this.parcelColor$.value; }
  readonly parcelColor$ = new BehaviorSubject<[number, number, number]>(undefined);

  constructor(private options: ClientControllerOptions) {
    this.initDiagrams();

    this.initParcels();

    this.initSchemas();
    this.loadSchemas();

    this.defineParcelColor(options.color);
    if (options.parcelYear !== undefined) {
      this.setParcelYear(options.parcelYear);
    }
  }

  /**
   * Teardown everything
   * @internal
   */
  destroy() {
    this.message$.next(undefined);
    this.teardownDiagrams();
    this.teardownParcels();
    this.teardownParcelElements();
    this.teardownSchemas();
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
   * Define a color for that controller and apply the proper
   * styling (either single client style or multi client style)
   * @param color RGB color
   */
  defineParcelColor(color: [number, number, number] | undefined) {
    this.parcelColor$.next(color);

    const olParcelLayerStyle = createPerClientParcelLayerStyle(color);
    this.parcelStore.layer.ol.setStyle(olParcelLayerStyle);

    this.applyParcelElementStyle();
    if (this.currentStyle === 'multi') {
      this.applyParcelMultiClientStyle();
    }
  }

  /**
   * Apply multi-client style on parcels
   */
  applyParcelMultiClientStyle() {
    const parcelColor = this.parcelColor$.value;
    const olParcelLayerStyle = createPerClientParcelLayerStyle(parcelColor);
    this.parcelStore.layer.ol.setStyle(olParcelLayerStyle);
    this.currentStyle = 'multi';
  }

  /**
   * Apply single-client style on parcels
   */
  applyParcelSingleClientStyle() {
    const olParcelLayerStyle = createParcelLayerStyle();
    this.parcelStore.layer.ol.setStyle(olParcelLayerStyle);
    this.currentStyle = 'single';
  }

  /**
   * Activate parcel elements
   */
  activateParcelElements() {
    this.parcelElementsActive$.next(true);
    this.unobserveDiagrams();
    this.initParcelElements();
    this.loadParcelElements();
    this.teardownParcels();
    this.workspaceStore.activateWorkspace(this.parcelElementWorkspace);
  }

  /**
   * Deactivate parcel elements
   */
  deactivateParcelElements() {
    if (!this.parcelElementTransaction.empty) {
      return this.parcelElementTransactionService.prompt({
        client: this.client,
        annee: this.parcelYear,
        transaction: this.parcelElementTransaction,
        proceed: () => this.deactivateParcelElements()
      });
    }

    this.unobserveDiagrams();
    this.teardownParcelElements();
    this.initParcels();
    this.loadParcels();
    this.workspaceStore.activateWorkspace(this.parcelWorkspace);
  }

  /******* Diagrams ********/

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
  }

  /**
   * Clear the diagram store and teardown observers
   * @param diagrams Diagrams
   */
  private teardownDiagrams() {
    this.unobserveDiagrams();
    this.diagramStore.clear();
  }

  /**
   * Load diagrams into the store and select them all
   * @param diagrams Diagrams
   */
  private loadDiagrams(diagrams: ClientParcelDiagram[]) {
    this.diagramStore.state.clear();
    this.diagramStore.load(diagrams.filter((diagram: ClientParcelDiagram) => diagram.id !== 9999));
    this.diagramStore.state.updateMany(diagrams, {selected: true});
  }

  /**
   * Observe diagrams selection
   */
  private observeDiagrams() {
    // Need to skip 2 because the current value is emitted then, the new one. We skip them
    // both because the parcel store and parcel element store both have a loading
    // strategy that do an inital zoom
    this.diagram$$ = this.diagramStore.stateView
      .manyBy$((record: EntityRecord<ClientParcelDiagram>) => record.state.selected === true)
      .pipe(skip(2))
      .subscribe((records: EntityRecord<ClientParcelDiagram>[]) => {
        const diagrams = records.map((record: EntityRecord<ClientParcelDiagram>) => record.entity);
        this.onSelectDiagrams(diagrams);
      });
  }

  /**
   * Unobserve diagrams selection
   */
  private unobserveDiagrams() {
    if (this.diagram$$ !== undefined) {
      this.diagram$$.unsubscribe();
      this.diagram$$ = undefined;
    }
  }

  /**
   * When diagrams are selected, filter parcels and parcel elements
   * @param diagrams Selected diagrams
   */
  private onSelectDiagrams(diagrams: ClientParcelDiagram[]) {
    this.filterParcelsByDiagrams(diagrams);
  }

  /**
   * Filter parcels by diagrams
   * @param diagrams Diagrams
   */
  private filterParcelsByDiagrams(diagrams: ClientParcelDiagram[]) {
    const diagramIds = diagrams.map((diagram: ClientParcelDiagram) => diagram.id);
    const filterClause = function(parcel: ClientParcel | ClientParcelElement): boolean {
      const noDiagramme = parcel.properties.noDiagramme;
      return diagramIds.includes(noDiagramme) || noDiagramme === 9999;
    };

    if (this.parcelElementsActive === true) {
      this.parcelElementStore.view.filter(filterClause);
    } else {
      this.parcelStore.view.filter(filterClause);
    }
  }

  /******* Parcels ********/

  /**
   * Initialize the parcel workspace and observe the selected parcels
   */
  private initParcels() {
    this.parcels$$ = this.parcelStore
      .stateView.manyBy$((record: EntityRecord<ClientParcel>) => record.state.selected === true)
      .subscribe((records: EntityRecord<ClientParcel>[]) => {
        this.onSelectParcels(records.map(record => record.entity));
      });

    this.parcelWorkspace.init();
    this.workspaceStore.update(this.parcelWorkspace);
  }

  /**
   * Deactivate the parcel workspace and teardown observers
   */
  private teardownParcels() {
    if (this.parcels$$ !== undefined) {
      this.parcels$$.unsubscribe();
    }

    this.parcelWorkspace.teardown();
    if (this.workspaceStore.activeWorkspace$.value === this.parcelWorkspace) {
      this.workspaceStore.deactivateWorkspace();
    }
    this.workspaceStore.delete(this.parcelWorkspace);
  }

  /**
   * Load parcels and diagrams into their respective store. Start observing
   * the selected diagrams. Also, display a message if no parcel are found.
   */
  private loadParcels() {
    this.parcelService.getParcels(this.client, this.parcelYear)
      .pipe(
        tap((parcels: ClientParcel[]) => {
          this.loadDiagrams(getDiagramsFromParcels(parcels));
          this.observeDiagrams();
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
   * Track selected parcels
   * @param parcels Parcels
   */
  private onSelectParcels(parcels: ClientParcel[]) {
    this.selectedParcels$.next(parcels);
  }

  /******* Parcel elements ********/

  /**
   * Initialize the parcel element workspace
   * and observe the selected parcels elements
   */
  private initParcelElements() {
    this.parcelElements$$ = this.parcelElementStore
      .stateView.manyBy$((record: EntityRecord<ClientParcelElement>) => record.state.selected === true)
      .subscribe((records: EntityRecord<ClientParcelElement>[]) => {
        this.onSelectParcelElements(records.map(record => record.entity));
      });

      this.parcelElementWorkspace.init();
      this.workspaceStore.update(this.parcelElementWorkspace);
  }

  /**
   * Deactivate the parcel element workspace and teardown observers.
   */
  private teardownParcelElements() {
    this.parcelElementsActive$.next(false);

    if (this.parcelElements$$ !== undefined) {
      this.parcelElements$$.unsubscribe();
    }

    this.parcelElementWorkspace.teardown();
    this.schemaElementTransaction.clear();
    if (this.workspaceStore.activeWorkspace$.value === this.parcelElementWorkspace) {
      this.workspaceStore.deactivateWorkspace();
    }
    this.workspaceStore.delete(this.parcelElementWorkspace);
  }

  /**
   * Load parcel elements and diagrams into their respective store.
   * Start observing the selected diagrams.
   */
  private loadParcelElements() {
    this.parcelElementService.getParcelElements(this.client, this.parcelYear)
      .pipe(
        tap((parcelElements: ClientParcelElement[]) => {
          this.loadDiagrams(getDiagramsFromParcelElements(parcelElements));
          this.observeDiagrams();
        })
      )
      .subscribe((parcelElements: ClientParcelElement[]) => {
        this.parcelElementWorkspace.load(parcelElements);
      });
  }

  /**
   * Track selected parcel element
   * @param parcelElements Parcel elements
   */
  private onSelectParcelElements(parcelElements: ClientParcelElement[]) {
    this.selectedParcelElements$.next(parcelElements);
  }

  /**
   * Apply a style to the parcel element layer. This style
   * uses the controller's parcel color.
   */
  private applyParcelElementStyle() {
    const color = this.parcelColor$.value;
    const olParcelElementLayerStyle = createParcelElementLayerStyle(color);
    this.parcelElementStore.layer.ol.setStyle(olParcelElementLayerStyle);
  }

  /******* Schemas ********/

  /**
   * Initialize the schema workspace and observe the selected schema
   */
  private initSchemas() {
    this.schema$$ = this.schemaStore
      .stateView.firstBy$((record: EntityRecord<ClientSchema>) => record.state.selected === true)
      .subscribe((record: EntityRecord<ClientSchema>) => {
        const schema = record ? record.entity : undefined;
        this.onSelectSchema(schema);
      });

    this.schemaWorkspace.init();
    this.workspaceStore.update(this.schemaWorkspace);
  }

  /**
   * Deactivate theschema workspace and teardown observers.
   */
  private teardownSchemas() {
    this.schema$$.unsubscribe();
    this.schemaWorkspace.teardown();
    if (this.workspaceStore.activeWorkspace$.value === this.schemaWorkspace) {
      this.workspaceStore.deactivateWorkspace();
    }
    this.workspaceStore.delete(this.schemaWorkspace);
    this.clearSchema();
  }

  /**
   * Load schemas into their store.
   */
  private loadSchemas() {
    this.schemaService.getSchemas(this.client)
      .subscribe((schemas: ClientSchema[]) => this.schemaWorkspace.load(schemas));
  }

  /**
   * Track sthe selected schema and load it's elements
   * @param schema Schema
   */
  private onSelectSchema(schema: ClientSchema) {
    if (schema !== undefined && this.schema !== undefined && schema.id === this.schema.id) {
      return;
    }
    this.setSchema(schema);
  }

  /**
   * Set the current schema. Initialize it's schema elements. If a
   * transaction is ongoing, make sure it's resolved first.
   * @param schema Schema
   */
  private setSchema(schema: ClientSchema) {
    if (!this.schemaElementTransaction.empty) {
      return this.schemaElementTransactionService.prompt({
        schema: this.schema,
        transaction: this.schemaElementTransaction,
        proceed: () => this.setSchema(schema),
        abort: () => this.schemaStore.state.update(this.schema, {selected: true}, true)
      });
    }

    this.clearSchema();

    if (schema !== undefined) {
      this.initSchemaElements(schema);
      this.loadSchemaElements(schema);
    }
    this.schema$.next(schema);
  }

  /**
   * Clear the current schema and its elements
   */
  private clearSchema() {
    if (this.schema === undefined) { return; }

    this.teardownSchemaElements();
    this.schema$.next(undefined);
  }

  /******* Schema elements ********/

  /**
   * Initialize the schema element workspace and observe the selected schema elements
   */
  private initSchemaElements(schema: ClientSchema) {
    this.schemaElements$$ = this.schemaElementStore
      .stateView.manyBy$((record: EntityRecord<ClientSchemaElement>) => record.state.selected === true)
      .subscribe((records: EntityRecord<ClientSchemaElement>[]) => {
        this.onSelectSchemaElements(records.map(record => record.entity));
      });

    this.schemaElementWorkspace.init();
    this.workspaceStore.update(this.schemaElementWorkspace);
  }

  /**
   * Deactivate theschema workspace and teardown observers.
   */
  private teardownSchemaElements() {
    if (this.schemaElements$$ !== undefined) {
      this.schemaElements$$.unsubscribe();
    }

    this.schemaElementWorkspace.teardown();
    this.schemaElementTransaction.clear();
    if (this.workspaceStore.activeWorkspace$.value === this.schemaElementWorkspace) {
      this.workspaceStore.deactivateWorkspace();
    }
    this.workspaceStore.delete(this.schemaElementWorkspace);
  }

  /**
   * Load schemas elements into their store. Style the schema element
   * layer based on the types accepted by the schema.
   * @param schema Schema
   */
  private loadSchemaElements(schema: ClientSchema) {
    this.schemaElementService.getSchemaElementTypes(schema.type)
      .pipe(
        concatMap((types: ClientSchemaElementTypes) => {
          return this.schemaElementService.getSchemaElements(schema).pipe(
            map((elements: ClientSchemaElement[]) => [types, elements])
          );
        })
      )
      .subscribe((bunch: [ClientSchemaElementTypes, ClientSchemaElement[]]) => {
        const [types, elements] = bunch;
        const olStyle = createSchemaElementLayerStyle(types);
        this.schemaElementStore.layer.ol.setStyle(olStyle);
        this.schemaElementStore.load(elements);
      });
  }

  /**
   * Track selected schema elements
   * @param schemaElements Schema elements
   */
  private onSelectSchemaElements(schemaElements: ClientSchemaElement[]) {
    this.selectedSchemaElements$.next(schemaElements);
  }

}
