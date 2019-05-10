import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { EntityRecord, EntityStore, EntityTransaction, Editor, EditorStore } from '@igo2/common';
import {
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  IgoMap
} from '@igo2/geo';

import {
  Client,
  ClientParcelDiagram,
  ClientParcel,
  ClientSchema,
  ClientSchemaElement,
  ClientSchemaElementTypes,
  ClientSchemaElementService,
  createSchemaElementLayerStyle,
  createPerClientParcelLayerStyle,
  createParcelLayerStyle
} from 'src/lib/client';

import { ClientResolutionService } from './client-resolution.service';

export interface ClientWorkspaceOptions {
  map: IgoMap;
  client: Client;
  editorStore: EditorStore;
  parcelEditor: Editor<ClientParcel>;
  schemaEditor: Editor<ClientSchema>;
  schemaElementEditor: Editor<ClientSchemaElement>;
  schemaElementService: ClientSchemaElementService;
  resolutionService: ClientResolutionService;
  color?: [number, number, number];
  // moveToParcels?: boolean;
}

export class ClientWorkspace {

  readonly message$ = new BehaviorSubject<string>(undefined);

  readonly color$ = new BehaviorSubject<[number, number, number]>(undefined);

  /** Subscription to the selected diagram  */
  private diagram$$: Subscription;

  /** Subscription to the selected schema  */
  private schema$$: Subscription;

  /** Subscription to the selected schema element  */
  private schemaElement$$: Subscription;

  /** Map */
  get map(): IgoMap {
    return this.options.map;
  }

  /** Active client */
  get client(): Client {
    return this.options.client;
  }

  /** Active schema */
  get schema(): ClientSchema { return this._schema; }
  private _schema: ClientSchema;

  /** Active schema element */
  get schemaElement(): ClientSchemaElement { return this._schemaElement; }
  private _schemaElement: ClientSchemaElement;

  /** Parcel editor */
  get editorStore(): EditorStore {
    return this.options.editorStore;
  }

  /** Parcel editor */
  get parcelEditor(): Editor<ClientParcel> {
    return this.options.parcelEditor;
  }

  /** Store that holds the parcels of the active client */
  get parcelStore(): FeatureStore<ClientParcel> {
    return this.parcelEditor.entityStore as FeatureStore<ClientParcel>;
  }

   /** Schema editor */
   get schemaEditor(): Editor<ClientSchema> {
    return this.options.schemaEditor;
  }

  /** Store that holds the schemas of the active client */
  get schemaStore(): EntityStore<ClientSchema> {
    return this.schemaEditor.entityStore as EntityStore<ClientSchema>;
  }

  /** Element editor */
  get schemaElementEditor(): Editor<ClientSchemaElement> {
    return this.options.schemaElementEditor;
  }

  /** Store that holds the elements of the active schema */
  get schemaElementStore(): FeatureStore<ClientSchemaElement> {
    return this.schemaElementEditor.entityStore as FeatureStore<ClientSchemaElement>;
  }

  /** Element service */
  get schemaElementService(): ClientSchemaElementService {
    return this.options.schemaElementService;
  }

  get resolutionService(): ClientResolutionService {
    return this.options.resolutionService;
  }

  /** Element transaction */
  get transaction(): EntityTransaction { return this._transaction; }
  private _transaction: EntityTransaction = new EntityTransaction();

  /** Store that holds the diagrams of the active client */
  get diagramStore(): EntityStore<ClientParcelDiagram> { return this._diagramStore; }
  private _diagramStore: EntityStore<ClientParcelDiagram>;

  /** Client color */
  get color(): [number, number, number] { return this.color$.value; }

  constructor(private options: ClientWorkspaceOptions) {
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
    // const moveToParcels = this.options.moveToParcels !== false;
    // this.parcelStore.load(this.client.parcels, moveToParcels);
    this.parcelStore.load(this.client.parcels);
    this.addParcelLayer();
    this.editorStore.update(this.parcelEditor);
    this.editorStore.activateEditor(this.parcelEditor);

    if (this.client.parcels.length === 0) {
      this.message$.next('client.error.noparcel');
    } else {
      this.message$.next(undefined);
    }
  }

  private teardownParcels() {
    const loading = this.parcelStore.getStrategyOfType(FeatureStoreLoadingStrategy);
    loading.unbindStore(this.parcelStore);
    const selection = this.parcelStore.getStrategyOfType(FeatureStoreSelectionStrategy);
    selection.unbindStore(this.parcelStore);

    this.removeParcelLayer();
    this.parcelEditor.deactivate();
    this.parcelStore.clear();
    this.editorStore.delete(this.parcelEditor);
  }

  private initSchemas() {
    this.schemaStore.load(this.client.schemas);
    this.schema$$ = this.schemaStore
      .stateView.firstBy$((record: EntityRecord<ClientSchema>) => record.state.selected === true)
      .subscribe((record: EntityRecord<ClientSchema>) => {
        const schema = record ? record.entity : undefined;
        this.onSelectSchema(schema);
      });

    this.editorStore.update(this.schemaEditor);
  }

  private teardownSchemas() {
    this.schema$$.unsubscribe();
    this.schemaEditor.deactivate();
    this.schemaStore.clear();
    this.editorStore.delete(this.schemaEditor);
    this.clearSchema();
  }

  private initSchemaElements(schema: ClientSchema) {
    this.schemaElement$$ = this.schemaElementStore
      .stateView.firstBy$((record: EntityRecord<ClientSchemaElement>) => record.state.selected === true)
      .subscribe((record: EntityRecord<ClientSchemaElement>) => {
        const schemaElement = record ? record.entity : undefined;
        this.onSelectSchemaElement(schemaElement);
      });

    this.parcelStore.state.updateAll({selected: false});
    this.addSchemaElementLayer();
    this.loadSchemaElements(schema);
    this.editorStore.update(this.schemaElementEditor);
  }

  private teardownSchemaElements() {
    if ( this.schemaElement$$ !== undefined) {
      this.schemaElement$$.unsubscribe();
    }

    const loading = this.schemaElementStore.getStrategyOfType(FeatureStoreLoadingStrategy);
    loading.unbindStore(this.schemaElementStore);
    const selection = this.schemaElementStore.getStrategyOfType(FeatureStoreSelectionStrategy);
    selection.unbindStore(this.schemaElementStore);

    this.removeSchemaElementLayer();
    this.schemaElementEditor.deactivate();
    this.schemaElementStore.clear();
    this.transaction.clear();
    this.editorStore.delete(this.schemaElementEditor);
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

  private onSelectSchema(schema: ClientSchema) {
    if (schema !== undefined && this.schema !== undefined && schema.id === this.schema.id) {
      return;
    }
    this.setSchema(schema);
  }

  private setSchema(schema: ClientSchema) {
    if (!this.transaction.empty) {
      this.resolutionService.enqueue({
        proceed: () => this.setSchema(schema),
        abort: () => this.schemaStore.state.update(this.schema, {selected: true}, true),
        workspace: this
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

  private loadSchemaElements(schema: ClientSchema) {
    this.schemaElementService.getSchemaElementTypes(schema.type)
      .pipe(
        concatMap((types: ClientSchemaElementTypes) => {
          return this.schemaElementService.getElements(schema).pipe(
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
}
