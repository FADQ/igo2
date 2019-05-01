import { Inject, Injectable } from '@angular/core';

import { concatMap, map } from 'rxjs/operators';

import {
  Action,
  ActionStore,
  Editor,
  EntityTransaction,
  EntityTableColumn,
  getEntityRevision,
  Widget
} from '@igo2/common';
import {
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  FeatureDataSource,
  IgoMap,
  VectorLayer,
  entitiesToRowData,
  exportToCSV
} from '@igo2/geo';
import { MapState } from '@igo2/integration';

import {
  ClientSchema,
  ClientSchemaElement,
  ClientSchemaElementTypes,
  ClientSchemaElementTableService,
  ClientSchemaElementCreateWidget,
  ClientSchemaElementUpdateWidget,
  ClientSchemaElementReincludeWidget,
  ClientSchemaElementSliceWidget,
  ClientSchemaElementSaverWidget,
  ClientSchemaElementUndoWidget,
  ClientSchemaElementImportDataWidget,
  ClientSchemaElementService,
  createSchemaElementLayer,
  createSchemaElementLayerStyle,
  createClientDefaultSelectionStyle,
  generateOperationTitle
} from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementState {

  editor: Editor;

  readonly transaction: EntityTransaction = new EntityTransaction();

  private schema: ClientSchema;

  get map(): IgoMap { return this.mapState.map; }

  get element(): ClientSchemaElement {
    return this.editor.entity as ClientSchemaElement;
  }

  get elementStore():  FeatureStore<ClientSchemaElement> {
    return this.editor.entityStore as FeatureStore<ClientSchemaElement>;
  }

  constructor(
    private mapState: MapState,
    private clientSchemaElementTableService: ClientSchemaElementTableService,
    private clientSchemaElementService: ClientSchemaElementService,
    @Inject(ClientSchemaElementCreateWidget) private clientSchemaElementCreateWidget: Widget,
    @Inject(ClientSchemaElementUpdateWidget) private clientSchemaElementUpdateWidget: Widget,
    @Inject(ClientSchemaElementReincludeWidget) private clientSchemaElementReincludeWidget: Widget,
    @Inject(ClientSchemaElementSliceWidget) private clientSchemaElementSliceWidget: Widget,
    @Inject(ClientSchemaElementSaverWidget) private clientSchemaElementSaverWidget: Widget,
    @Inject(ClientSchemaElementUndoWidget) private clientSchemaElementUndoWidget: Widget,
    @Inject(ClientSchemaElementImportDataWidget) private clientSchemaElementImportDataWidget: Widget
  ) {
    this.editor = new Editor({
      id: 'fadq.client-schema-element-editor',
      title: 'Éléments géométriques du schéma',
      tableTemplate: clientSchemaElementTableService.buildTable(),
      entityStore: this.createStore(),
      actionStore: new ActionStore([])
    });
    this.editor.actionStore.load(this.buildActions());
  }

  setSchema(schema: ClientSchema | undefined) {
    this.schema = schema;

    if (schema !== undefined) {
      this.addLayer();
      this.loadSchemaElements(schema);
    } else {
      this.removeLayer();
      this.transaction.clear();
      this.elementStore.clear();
      this.editor.deactivate();
    }
  }

  private addLayer() {
    if (this.elementStore.layer.map === undefined) {
      this.elementStore.activateStrategyOfType(FeatureStoreLoadingStrategy);
      this.elementStore.activateStrategyOfType(FeatureStoreSelectionStrategy);
      this.map.addLayer(this.elementStore.layer);
    }
  }

  private removeLayer() {
    if (this.elementStore.layer.map !== undefined) {
      this.elementStore.deactivateStrategyOfType(FeatureStoreLoadingStrategy);
      this.elementStore.deactivateStrategyOfType(FeatureStoreSelectionStrategy);
      this.map.removeLayer(this.elementStore.layer);
    }
  }

  private createStore(): FeatureStore<ClientSchemaElement> {
    const store = new FeatureStore<ClientSchemaElement>([], {
      getKey: (entity: ClientSchemaElement) => {
        return entity.properties.idElementGeometrique || entity.meta.id;
      },
      map: this.mapState.map
    });

    const layer = createSchemaElementLayer();
    store.bindLayer(layer);

    const viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];
    const loadingStrategy = new FeatureStoreLoadingStrategy({
      viewScale
    });
    store.addStrategy(loadingStrategy);

    const selectionStrategy = new FeatureStoreSelectionStrategy({
      map: this.mapState.map,
      layer: new VectorLayer({
        title: 'Éléments géométriques sélectionnés',
        zIndex: 104,
        source: new FeatureDataSource(),
        style: createClientDefaultSelectionStyle(),
        showInLayerList: true,
        removable: false,
        browsable: false
      }),
      many: true,
      viewScale,
      areaRatio: 0.004
    });
    store.addStrategy(selectionStrategy);

    return store;
  }

  private buildActions(): Action[] {
    const schemaIsDefined = () => this.schema !== undefined;
    const elementIsDefined = () => this.element !== undefined;
    const transactionIsNotEmpty = () => {
      return this.transaction !== undefined && this.transaction.empty === false;
    };
    const transactionIsNotInCommitPhase = () => {
      return this.transaction !== undefined && this.transaction.inCommitPhase === false;
    };
    const elementCanBeFilled = () => {
      const geometry = this.element === undefined ? undefined : this.element.geometry;
      return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length > 1;
    };
    const elementIsAPolygon = () => {
      const geometry = this.element === undefined ? undefined : this.element.geometry;
      return geometry !== undefined && geometry.type === 'Polygon';
    };

    return [
      {
        id: 'create',
        icon: 'add',
        title: 'client.schemaElement.create',
        tooltip: 'client.schemaElement.create.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaElementCreateWidget, {
          schema: this.schema,
          map: this.map,
          transaction: this.transaction,
          store: this.elementStore
        }),
        conditions: [schemaIsDefined, transactionIsNotInCommitPhase]
      },
      {
        id: 'update',
        icon: 'edit',
        title: 'client.schemaElement.update',
        tooltip: 'client.schemaElement.update.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaElementUpdateWidget, {
          schema: this.schema,
          map: this.map,
          element: this.element,
          transaction: this.transaction,
          store: this.elementStore
        }),
        conditions: [schemaIsDefined, elementIsDefined, transactionIsNotInCommitPhase]
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'client.schemaElement.delete',
        tooltip: 'client.schemaElement.delete.tooltip',
        handler: () => {
          const element = this.element;
          this.transaction.delete(element, this.elementStore, {
            title: generateOperationTitle(element)
          });
        },
        conditions: [schemaIsDefined, elementIsDefined, transactionIsNotInCommitPhase]
      },
      {
        id: 'reinclude',
        icon: 'select_all',
        title: 'client.schemaElement.reinclude',
        tooltip: 'client.schemaElement.reinclude.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaElementReincludeWidget, {
          map: this.map,
          element: this.element,
          transaction: this.transaction,
          store: this.elementStore
        }),
        conditions: [
          schemaIsDefined,
          elementIsDefined,
          transactionIsNotInCommitPhase,
          elementCanBeFilled
        ]
      },
      {
        id: 'slice',
        icon: 'flip',
        title: 'client.schemaElement.slice',
        tooltip: 'client.schemaElement.slice.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaElementSliceWidget, {
          schema: this.schema,
          map: this.map,
          element: this.element,
          transaction: this.transaction,
          store: this.elementStore
        }),
        conditions: [
          schemaIsDefined,
          elementIsDefined,
          transactionIsNotInCommitPhase,
          elementIsAPolygon
        ]
      },
      {
        id: 'save',
        icon: 'save',
        title: 'client.schemaElement.save',
        tooltip: 'client.schemaElement.save.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaElementSaverWidget, {
          store: this.elementStore,
          schema: this.schema,
          transaction: this.transaction
        }),
        conditions: [schemaIsDefined, transactionIsNotEmpty, transactionIsNotInCommitPhase]
      },
      {
        id: 'undo',
        icon: 'undo',
        title: 'client.schemaElement.undo',
        tooltip: 'client.schemaElement.undo.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaElementUndoWidget, {
          transaction: this.transaction
        }),
        conditions: [schemaIsDefined, transactionIsNotEmpty, transactionIsNotInCommitPhase]
      },
      {
        id: 'importData',
        icon: 'input',
        title: 'client.schemaElement.importData',
        tooltip: 'client.schemaElement.importData.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaElementImportDataWidget, {
          schema: this.schema,
          element: this.element,
          transaction: this.transaction,
          store: this.elementStore
        }),
        conditions: [schemaIsDefined, transactionIsNotInCommitPhase]
      },
      {
        id: 'export',
        icon: 'file_download',
        title: 'client.schemaElement.exportToCSV',
        tooltip: 'client.schemaElement.exportToCSV.tooltip',
        handler: () => {
          const columns = this.editor.tableTemplate.columns;
          const headers = columns.map((column: EntityTableColumn) => column.title);
          const rows = entitiesToRowData(this.elementStore.view.all(), columns);

          const fileName = `Éléments du schéma ${this.schema.id}.csv`;
          exportToCSV([headers].concat(rows), fileName, ';');
        }
      }
    ];
  }

  private loadSchemaElements(schema: ClientSchema) {
    this.clientSchemaElementService.getSchemaElementTypes(schema.type)
      .pipe(
        concatMap((types: ClientSchemaElementTypes) => {
          return this.clientSchemaElementService.getElements(schema).pipe(
            map((elements: ClientSchemaElement[]) => [types, elements])
          );
        })
      )
      .subscribe((bunch: [ClientSchemaElementTypes, ClientSchemaElement[]]) => {
        const [types, elements] = bunch;
        const olStyle = createSchemaElementLayerStyle(types);
        this.elementStore.layer.ol.setStyle(olStyle);
        this.elementStore.load(elements);
      });
  }

}
