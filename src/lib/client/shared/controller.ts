import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

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
import { ClientParcelElementTxState } from '../parcel-element/shared/client-parcel-element.enums';
import { createParcelElementLayerStyle } from '../parcel-element/shared/client-parcel-element.utils';
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
  controllerStore: EntityStore<ClientController>;
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

  readonly color$ = new BehaviorSubject<[number, number, number]>(undefined);

  readonly parcelElementTxActive$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
  get controllerStore(): EntityStore<ClientController> {
    return this.options.controllerStore;
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

  /** Store that holds the parcels of the active client */
  get parcelStore(): FeatureStore<ClientParcel> {
    return this.parcelWorkspace.parcelStore;
  }

  /** Selected parcel elements */
  get selectedParcels(): ClientParcel[] { return this._selectedParcels; }
  private _selectedParcels: ClientParcel[] = [];

  /** Selected parcel elements */
  get activeParcel(): ClientParcel {
    return this._selectedParcels.length === 1 ? this.selectedParcels[0] : undefined;
  }

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
  get selectedParcelElements(): ClientParcelElement[] { return this._selectedParcelElements; }
  private _selectedParcelElements: ClientParcelElement[] = [];

  /** Selected parcel elements */
  get activeParcelElement(): ClientParcelElement {
    return this._selectedParcelElements.length === 1 ? this.selectedParcelElements[0] : undefined;
  }

  /** Parcel element transaction */
  get parcelElementTransaction(): EntityTransaction { return this._parcelElementTransaction; }
  private _parcelElementTransaction: EntityTransaction = new EntityTransaction();

  get parcelElementService(): ClientParcelElementService {
    return this.options.parcelElementService;
  }

  get parcelElementTransactionService(): ClientParcelElementTransactionService {
    return this.options.parcelElementTransactionService;
  }

  /** Whether parcel element tx is active */
  get parcelElementTxActive(): boolean { return this.parcelElementTxActive$.value; }

  /** Schema workspace */
  get schemaWorkspace(): ClientSchemaWorkspace {
    return this.options.schemaWorkspace;
  }

  /** Store that holds the schemas of the active client */
  get schemaStore(): EntityStore<ClientSchema> {
    return this.schemaWorkspace.schemaStore;
  }

  /** Active schema */
  get schema(): ClientSchema { return this._schema; }
  private _schema: ClientSchema;

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
  get selectedSchemaElements(): ClientSchemaElement[] { return this._selectedSchemaElements; }
  private _selectedSchemaElements: ClientSchemaElement[] = [];

  /** Selected schema elements */
  get activeSchemaElement(): ClientSchemaElement {
    return this._selectedSchemaElements.length === 1 ? this.selectedSchemaElements[0] : undefined;
  }

  /** Element transaction */
  get schemaElementTransaction(): EntityTransaction { return this._schemaElementTransaction; }
  private _schemaElementTransaction: EntityTransaction = new EntityTransaction();

  get schemaElementService(): ClientSchemaElementService {
    return this.options.schemaElementService;
  }

  get schemaElementTransactionService(): ClientSchemaElementTransactionService {
    return this.options.schemaElementTransactionService;
  }

  /** Store that holds the diagrams of the active client */
  get diagramStore(): EntityStore<ClientParcelDiagram> { return this._diagramStore; }
  private _diagramStore: EntityStore<ClientParcelDiagram>;

  /** Client color */
  get color(): [number, number, number] { return this.color$.value; }

  constructor(private options: ClientControllerOptions) {
    this.initDiagrams();
    this.initParcels();
    this.initSchemas();
    this.defineColor(options.color);
  }

  destroy() {
    this.message$.next(undefined);
    this.teardownDiagrams();
    this.teardownParcels();
    this.teardownParcelElements();
    this.teardownSchemas();
  }

  setParcelYear(parcelYear: number) {
    this._parcelYear = parcelYear;
    this.loadParcels();
  }

  getParcelTxState(): Observable<ClientParcelElementTxState> {
    return this.parcelElementService.getParcelTxState(this.client, this.parcelYear);
  }

  prepareParcelTx(): Observable<void> {
    return this.parcelElementService.prepareParcelTx(this.client, this.parcelYear);
  }

  activateParcelTx() {
    this.parcelElementTxActive$.next(true);
    this.initParcelElements();
    this.teardownParcels();
    this.workspaceStore.activateWorkspace(this.parcelElementWorkspace);
  }

  deactivateParcelTx() {
    if (!this.parcelElementTransaction.empty) {
      this.parcelElementTransactionService.enqueue({
        client: this.client,
        annee: this.parcelYear,
        transaction: this.parcelElementTransaction,
        proceed: () => this.deactivateParcelTx()
      });
      return;
    }

    this.parcelElementTxActive$.next(false);
    this.teardownParcelElements();
  }

  activateParcels() {
    this.initParcels();
    this.workspaceStore.activateWorkspace(this.parcelWorkspace);
  }

  defineColor(color: [number, number, number] | undefined) {
    this.color$.next(color);

    const olParcelLayerStyle = createPerClientParcelLayerStyle(color);
    this.parcelStore.layer.ol.setStyle(olParcelLayerStyle);

    this.applyParcelElementStyle();
    if (this.currentStyle === 'multi') {
      this.applyMultiClientStyle();
    }
  }

  applyMultiClientStyle() {
    const color = this.color$.value;
    const olParcelLayerStyle = createPerClientParcelLayerStyle(color);
    this.parcelStore.layer.ol.setStyle(olParcelLayerStyle);
    this.currentStyle = 'multi';
  }

  applySingleClientStyle() {
    const olParcelLayerStyle = createParcelLayerStyle();
    this.parcelStore.layer.ol.setStyle(olParcelLayerStyle);
    this.currentStyle = 'single';
  }

  private applyParcelElementStyle() {
    const color = this.color$.value;
    const olParcelElementLayerStyle = createParcelElementLayerStyle(color);
    this.parcelElementStore.layer.ol.setStyle(olParcelElementLayerStyle);
  }

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

  private loadDiagrams(diagrams: ClientParcelDiagram[]) {
    this.diagramStore.load(diagrams);
    this.diagramStore.state.updateMany(diagrams, {selected: true});
  }

  private teardownDiagrams() {
    this.diagram$$.unsubscribe();
    this.diagramStore.clear();
  }

  private initParcels() {
    this.parcels$$ = this.parcelStore
      .stateView.manyBy$((record: EntityRecord<ClientParcel>) => record.state.selected === true)
      .subscribe((records: EntityRecord<ClientParcel>[]) => {
        this.onSelectParcels(records.map(record => record.entity));
      });

    this.parcelWorkspace.init();
    this.workspaceStore.update(this.parcelWorkspace);
    this.loadParcels();
  }

  private loadParcels() {
    this.parcelService.getParcels(this.client, this.parcelYear)
      .subscribe((parcels: ClientParcel[]) => {
        const diagrams = getDiagramsFromParcels(parcels);
        this.loadDiagrams(diagrams);
        this.parcelWorkspace.load(parcels);

        if (parcels.length === 0) {
          this.message$.next('client.error.noparcel');
        } else {
          this.message$.next(undefined);
        }
      });
  }

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

  private initParcelElements() {
    this.parcelElements$$ = this.parcelElementStore
      .stateView.manyBy$((record: EntityRecord<ClientParcelElement>) => record.state.selected === true)
      .subscribe((records: EntityRecord<ClientParcelElement>[]) => {
        this.onSelectParcelElements(records.map(record => record.entity));
      });

      this.parcelElementWorkspace.init();
      this.workspaceStore.update(this.parcelElementWorkspace);
      this.loadParcelElements();
  }

  private loadParcelElements() {
    this.parcelElementService.getParcelElements(this.client, this.parcelYear)
      .subscribe((parcelElements: ClientParcelElement[]) => {
        this.parcelElementWorkspace.load(parcelElements);
      });
  }

  private teardownParcelElements() {
    this.parcelElementTxActive$.next(false);

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

  private initSchemas() {
    this.schema$$ = this.schemaStore
      .stateView.firstBy$((record: EntityRecord<ClientSchema>) => record.state.selected === true)
      .subscribe((record: EntityRecord<ClientSchema>) => {
        const schema = record ? record.entity : undefined;
        this.onSelectSchema(schema);
      });

    this.schemaWorkspace.init();
    this.workspaceStore.update(this.schemaWorkspace);
    this.loadSchemas();
  }

  private loadSchemas() {
    this.schemaService.getSchemas(this.client)
      .subscribe((schemas: ClientSchema[]) => {
        this.schemaWorkspace.load(schemas);
      });
  }

  private teardownSchemas() {
    this.schema$$.unsubscribe();
    this.schemaWorkspace.teardown();
    if (this.workspaceStore.activeWorkspace$.value === this.schemaWorkspace) {
      this.workspaceStore.deactivateWorkspace();
    }
    this.workspaceStore.delete(this.schemaWorkspace);
    this.clearSchema();
  }

  private initSchemaElements(schema: ClientSchema) {
    this.schemaElements$$ = this.schemaElementStore
      .stateView.manyBy$((record: EntityRecord<ClientSchemaElement>) => record.state.selected === true)
      .subscribe((records: EntityRecord<ClientSchemaElement>[]) => {
        this.onSelectSchemaElements(records.map(record => record.entity));
      });

    this.schemaElementWorkspace.init();
    this.workspaceStore.update(this.schemaElementWorkspace);
    this.loadSchemaElements(schema);
  }

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

  private onSelectDiagrams(diagrams: ClientParcelDiagram[]) {
    this.setDiagrams(diagrams);
  }

  private onSelectParcels(parcels: ClientParcel[]) {
    this._selectedParcels = parcels;
  }

  private onSelectParcelElements(parcelElements: ClientParcelElement[]) {
    this._selectedParcelElements = parcelElements;
  }

  private onSelectSchema(schema: ClientSchema) {
    if (schema !== undefined && this.schema !== undefined && schema.id === this.schema.id) {
      return;
    }
    this.setSchema(schema);
  }

  private onSelectSchemaElements(schemaElements: ClientSchemaElement[]) {
    this._selectedSchemaElements = schemaElements;
  }

  private setDiagrams(diagrams: ClientParcelDiagram[]) {
    const diagramIds = diagrams.map((diagram: ClientParcelDiagram) => diagram.id);
    const filterClause = function(parcel: ClientParcel | ClientParcelElement): boolean {
      const noDiagramme = parcel.properties.noDiagramme;
      return diagramIds.includes(noDiagramme) || noDiagramme === 9999;
    };
    this.parcelStore.view.filter(filterClause);
    this.parcelElementStore.view.filter(filterClause);
  }

  private setSchema(schema: ClientSchema) {
    if (!this.schemaElementTransaction.empty) {
      this.schemaElementTransactionService.enqueue({
        schema: this.schema,
        transaction: this.schemaElementTransaction,
        proceed: () => this.setSchema(schema),
        abort: () => this.schemaStore.state.update(this.schema, {selected: true}, true)
      });
      return;
    }

    this.clearSchema();

    if (schema !== undefined) {
      this.initSchemaElements(schema);
    }
    this._schema = schema;
  }

  private clearSchema() {
    if (this.schema === undefined) { return; }

    this.teardownSchemaElements();
    this._schema = undefined;
  }

}
