import { BehaviorSubject, Subscription } from 'rxjs';

import { EntityRecord, EntityStore, EntityTransaction, Workspace, WorkspaceStore } from '@igo2/common';
import {
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  IgoMap
} from '@igo2/geo';

import { Client } from '../shared/client.interfaces';
import { ClientParcel, ClientParcelDiagram } from '../parcel/shared/client-parcel.interfaces';
import { createPerClientParcelLayerStyle, createParcelLayerStyle } from '../parcel/shared/client-parcel.utils';
import { ClientParcelElementWorkspace } from '../parcel-element/shared/client-parcel-element-workspace';
import { ClientSchema } from '../schema/shared/client-schema.interfaces';
import { ClientSchemaElement } from '../schema-element/shared/client-schema-element.interfaces';
import { ClientSchemaElementWorkspace } from '../schema-element/shared/client-schema-element-workspace';
import { ClientSchemaElementService } from '../schema-element/shared/client-schema-element.service';
import { ClientParcelElement } from '../parcel-element/shared/client-parcel-element.interfaces';
import { ClientSchemaElementTransactionService } from '../schema-element/shared/client-schema-element-transaction.service';

export interface ClientControllerOptions {
  map: IgoMap;
  client: Client;
  workspaceStore: WorkspaceStore;
  parcelWorkspace: Workspace<ClientParcel>;
  parcelElementWorkspace: ClientParcelElementWorkspace;
  schemaWorkspace: Workspace<ClientSchema>;
  schemaElementWorkspace:ClientSchemaElementWorkspace;
  schemaElementService: ClientSchemaElementService;
  schemaElementTransactionService: ClientSchemaElementTransactionService;
  color?: [number, number, number];
}

export class ClientController {

  readonly message$ = new BehaviorSubject<string>(undefined);

  readonly color$ = new BehaviorSubject<[number, number, number]>(undefined);

  /** Subscription to the selected diagram  */
  private diagram$$: Subscription;

  private parcelLoadingStrategy: FeatureStoreLoadingStrategy;

  private parcelSelectionStrategy: FeatureStoreSelectionStrategy;

  /** Subscription to the selected parcel element  */
  private parcelElement$$: Subscription;

  private parcelElementLoadingStrategy: FeatureStoreLoadingStrategy;

  private parcelElementSelectionStrategy: FeatureStoreSelectionStrategy;

  /** Subscription to the selected schema  */
  private schema$$: Subscription;

  /** Subscription to the selected schema element  */
  private schemaElement$$: Subscription;

  private schemaElementLoadingStrategy: FeatureStoreLoadingStrategy;

  private schemaElementSelectionStrategy: FeatureStoreSelectionStrategy;

  /** Map */
  get map(): IgoMap { return this.options.map; }

  /** Active client */
  get client(): Client { return this.options.client; }

  /** Workspace store */
  get workspaceStore(): WorkspaceStore {
    return this.options.workspaceStore;
  }

  /** Parcel workspace */
  get parcelWorkspace(): Workspace<ClientParcel> {
    return this.options.parcelWorkspace;
  }

  /** Store that holds the parcels of the active client */
  get parcelStore(): FeatureStore<ClientParcel> {
    return this.parcelWorkspace.entityStore as FeatureStore<ClientParcel>;
  }

  /** Active parcel element workspace */
  get parcelElementWorkspace(): ClientParcelElementWorkspace {
    return this.options.parcelElementWorkspace;
  }

  /** Store that holds the parcel elements */
  get parcelElementStore(): FeatureStore<ClientParcelElement> {
    return this.parcelElementWorkspace.entityStore as FeatureStore<ClientParcelElement>;
  }

  /** Active parcel element */
  get parcelElement(): ClientParcelElement { return this._parcelElement; }
  private _parcelElement: ClientParcelElement;

  /** Schema workspace */
  get schemaWorkspace(): Workspace<ClientSchema> {
    return this.options.schemaWorkspace;
  }

  /** Store that holds the schemas of the active client */
  get schemaStore(): EntityStore<ClientSchema> {
    return this.schemaWorkspace.entityStore as EntityStore<ClientSchema>;
  }

  /** Active schema */
  get schema(): ClientSchema { return this._schema; }
  private _schema: ClientSchema;

  /** Active element workspace */
  get schemaElementWorkspace(): ClientSchemaElementWorkspace {
    return this.options.schemaElementWorkspace;
  }

  /** Store that holds the elements of the active schema */
  get schemaElementStore(): FeatureStore<ClientSchemaElement> {
    return this.schemaElementWorkspace.entityStore as FeatureStore<ClientSchemaElement>;
  }

  /** Element service */
  get schemaElementService(): ClientSchemaElementService {
    return this.options.schemaElementService;
  }

  get schemaElementTransactionService(): ClientSchemaElementTransactionService {
    return this.options.schemaElementTransactionService;
  }

  /** Active schema element */
  get schemaElement(): ClientSchemaElement { return this._schemaElement; }
  private _schemaElement: ClientSchemaElement;

  /** Element transaction */
  get transaction(): EntityTransaction { return this._transaction; }
  private _transaction: EntityTransaction = new EntityTransaction();

  /** Store that holds the diagrams of the active client */
  get diagramStore(): EntityStore<ClientParcelDiagram> { return this._diagramStore; }
  private _diagramStore: EntityStore<ClientParcelDiagram>;

  /** Client color */
  get color(): [number, number, number] { return this.color$.value; }

  constructor(private options: ClientControllerOptions) {
    this.initDiagrams();
    this.initParcels();
    this.initSchemas();
    this.setColor(options.color);
  }

  destroy() {
    this.message$.next(undefined);
    this.teardownDiagrams();
    this.teardownParcels();
    this.teardownSchemas();
  }

  setColor(color: [number, number, number] | undefined) {
    let olLayerStyle;
    if (color === undefined) {
      olLayerStyle = createParcelLayerStyle();
    } else {
      olLayerStyle = createPerClientParcelLayerStyle(color);
    }
    this.parcelStore.layer.ol.setStyle(olLayerStyle);
    this.color$.next(color);
  }

  startParcelEdition() {
    this.teardownParcels();
    this.initParcelElements();
    this.workspaceStore.activateWorkspace(this.parcelElementWorkspace);
  }

  stopParcelEdition() {
    this.teardownParcelElements();
    this.initParcels();
    this.workspaceStore.activateWorkspace(this.parcelWorkspace);
  }

  private initDiagrams() {
    this._diagramStore = new EntityStore<ClientParcelDiagram>(this.client.diagrams);
    this.diagramStore.view.sort({
      valueAccessor: (diagram: ClientParcelDiagram) => diagram.id,
      direction: 'asc'
    });

    this.diagram$$ = this.diagramStore.stateView
      .firstBy$((record: EntityRecord<ClientParcelDiagram>) => record.state.selected === true)
      .subscribe((record: EntityRecord<ClientParcelDiagram>) => {
        const diagram = record ? record.entity : undefined;
        this.onSelectDiagram(diagram);
      });
  }

  private teardownDiagrams() {
    this.diagram$$.unsubscribe();
    this.diagramStore.clear();
  }

  private initParcels() {
    const store = this.parcelStore;

    const parcelLoadingStrategy = store.getStrategyOfType(FeatureStoreLoadingStrategy);
    if (parcelLoadingStrategy === undefined && this.parcelLoadingStrategy !== undefined) {
      store.addStrategy(this.parcelLoadingStrategy, true);
    } else {
      this.parcelLoadingStrategy = parcelLoadingStrategy as FeatureStoreLoadingStrategy;
    }

    const parcelSelectionStrategy = store.getStrategyOfType(FeatureStoreSelectionStrategy);
    if (parcelSelectionStrategy === undefined && this.parcelSelectionStrategy !== undefined) {
      store.addStrategy(this.parcelSelectionStrategy, true);
    } else {
      this.parcelSelectionStrategy = parcelSelectionStrategy as FeatureStoreSelectionStrategy;
    }

    this.parcelStore.load(this.client.parcels);
    this.addParcelLayer();
    this.workspaceStore.update(this.parcelWorkspace);

    if (this.client.parcels.length === 0) {
      this.message$.next('client.error.noparcel');
    } else {
      this.message$.next(undefined);
    }
  }

  private teardownParcels() {
    const loading = this.parcelStore.getStrategyOfType(FeatureStoreLoadingStrategy);
    const selection = this.parcelStore.getStrategyOfType(FeatureStoreSelectionStrategy);
    this.parcelStore.removeStrategy(loading);
    this.parcelStore.removeStrategy(selection);

    this.removeParcelLayer();
    this.parcelWorkspace.deactivate();
    this.parcelStore.layer.ol.getSource().clear();
    this.parcelStore.clear();
    this.workspaceStore.delete(this.parcelWorkspace);
  }

  private initParcelElements() {
    const workspace = this.parcelElementWorkspace;
    const store = this.parcelElementStore;

    this.schemaElement$$ = store
      .stateView.firstBy$((record: EntityRecord<ClientParcelElement>) => record.state.selected === true)
      .subscribe((record: EntityRecord<ClientParcelElement>) => {
        const parcelElement = record ? record.entity : undefined;
        this.onSelectParcelElement(parcelElement);
      });

    const parcelElementLoadingStrategy = store.getStrategyOfType(FeatureStoreLoadingStrategy);
    if (parcelElementLoadingStrategy === undefined && this.parcelElementLoadingStrategy !== undefined) {
      store.addStrategy(this.parcelElementLoadingStrategy, true);
    } else {
      this.parcelElementLoadingStrategy = parcelElementLoadingStrategy as FeatureStoreLoadingStrategy;
    }

    const parcelElementSelectionStrategy = store.getStrategyOfType(FeatureStoreSelectionStrategy);
    if (parcelElementSelectionStrategy === undefined && this.parcelElementSelectionStrategy !== undefined) {
      store.addStrategy(this.parcelElementSelectionStrategy, true);
    } else {
      this.parcelElementSelectionStrategy = parcelElementSelectionStrategy as FeatureStoreSelectionStrategy;
    }

    workspace.loadParcelElements();
    this.workspaceStore.update(workspace);

    this.addParcelElementLayer();
  }

  private teardownParcelElements() {
    if (this.parcelElement$$ !== undefined) {
      this.parcelElement$$.unsubscribe();
    }

    this.parcelElementStore.removeStrategy(this.parcelElementLoadingStrategy);
    this.parcelElementStore.removeStrategy(this.parcelElementSelectionStrategy);

    this.removeParcelElementLayer();
    this.parcelElementWorkspace.deactivate();
    this.parcelElementStore.layer.ol.getSource().clear();
    this.parcelElementStore.clear();
    this.transaction.clear();

    this.workspaceStore.delete(this.parcelElementWorkspace);
  }

  private initSchemas() {
    this.schemaStore.load(this.client.schemas);
    this.schema$$ = this.schemaStore
      .stateView.firstBy$((record: EntityRecord<ClientSchema>) => record.state.selected === true)
      .subscribe((record: EntityRecord<ClientSchema>) => {
        const schema = record ? record.entity : undefined;
        this.onSelectSchema(schema);
      });

    this.workspaceStore.update(this.schemaWorkspace);
  }

  private teardownSchemas() {
    this.schema$$.unsubscribe();
    this.schemaWorkspace.deactivate();
    this.schemaStore.clear();
    this.workspaceStore.delete(this.schemaWorkspace);
    this.clearSchema();
  }

  private initSchemaElements(schema: ClientSchema) {
    const workspace = this.schemaElementWorkspace;
    const store = this.schemaElementStore;

    this.schemaElement$$ = store
      .stateView.firstBy$((record: EntityRecord<ClientSchemaElement>) => record.state.selected === true)
      .subscribe((record: EntityRecord<ClientSchemaElement>) => {
        const schemaElement = record ? record.entity : undefined;
        this.onSelectSchemaElement(schemaElement);
      });

    this.parcelStore.state.updateAll({selected: false});

    const schemaElementLoadingStrategy = store.getStrategyOfType(FeatureStoreLoadingStrategy);
    if (schemaElementLoadingStrategy === undefined && this.schemaElementLoadingStrategy !== undefined) {
      store.addStrategy(this.schemaElementLoadingStrategy, true);
    } else {
      this.schemaElementLoadingStrategy = schemaElementLoadingStrategy as FeatureStoreLoadingStrategy;
    }

    const schemaElementSelectionStrategy = store.getStrategyOfType(FeatureStoreSelectionStrategy);
    if (schemaElementSelectionStrategy === undefined && this.schemaElementSelectionStrategy !== undefined) {
      store.addStrategy(this.schemaElementSelectionStrategy, true);
    } else {
      this.schemaElementSelectionStrategy = schemaElementSelectionStrategy as FeatureStoreSelectionStrategy;
    }

    workspace.loadSchemaElements(schema);
    this.workspaceStore.update(workspace);

    this.addSchemaElementLayer();
  }

  private teardownSchemaElements() {
    if (this.schemaElement$$ !== undefined) {
      this.schemaElement$$.unsubscribe();
    }

    this.schemaElementStore.removeStrategy(this.schemaElementLoadingStrategy);
    this.schemaElementStore.removeStrategy(this.schemaElementSelectionStrategy);

    this.removeSchemaElementLayer();
    this.schemaElementWorkspace.deactivate();
    this.schemaElementStore.layer.ol.getSource().clear();
    this.schemaElementStore.clear();
    this.transaction.clear();
    this.workspaceStore.delete(this.schemaElementWorkspace);
  }

  private onSelectDiagram(diagram: ClientParcelDiagram) {
    this.setDiagram(diagram);
  }

  private setDiagram(diagram: ClientParcelDiagram) {
    this.parcelStore.state.clear();
    if (diagram === undefined) {
      this.parcelStore.view.filter(undefined);
    } else {
      const filterClause = function(parcel: ClientParcel): boolean {
        return parcel.properties.noDiagramme === diagram.id;
      };
      this.parcelStore.view.filter(filterClause);
    }
  }

  private onSelectParcelElement(parcelElement: ClientParcelElement) {
    this._parcelElement = parcelElement;
  }

  private onSelectSchema(schema: ClientSchema) {
    if (schema !== undefined && this.schema !== undefined && schema.id === this.schema.id) {
      return;
    }
    this.setSchema(schema);
  }

  private setSchema(schema: ClientSchema) {
    if (!this.transaction.empty) {
      this.schemaElementTransactionService.enqueue({
        schema: this.schema,
        transaction: this.transaction,
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

  private onSelectSchemaElement(schemaElement: ClientSchemaElement) {
    this._schemaElement = schemaElement;
  }

  private addParcelLayer() {
    if (this.parcelStore.layer.map === undefined) {
      this.map.addLayer(this.parcelStore.layer);
    }
  }

  private removeParcelLayer() {
    if (this.parcelStore.layer.map !== undefined) {
      this.map.removeLayer(this.parcelStore.layer);
    }
  }

  private addParcelElementLayer() {
    if (this.parcelElementStore.layer.map === undefined) {
      this.map.addLayer(this.parcelElementStore.layer);
    }
  }

  private removeParcelElementLayer() {
    if (this.parcelElementStore.layer.map !== undefined) {
      this.map.removeLayer(this.parcelElementStore.layer);
    }
  }

  private addSchemaElementLayer() {
    if (this.schemaElementStore.layer.map === undefined) {
      this.map.addLayer(this.schemaElementStore.layer);
    }
  }

  private removeSchemaElementLayer() {
    if (this.schemaElementStore.layer.map !== undefined) {
      this.map.removeLayer(this.schemaElementStore.layer);
    }
  }
}
