import { Inject, Injectable} from '@angular/core';

import { Action, ActionStore, EntityStore, Editor, Widget } from '@igo2/common';

import {
  Client,
  ClientSchema,
  ClientSchemaTableService,
  ClientSchemaCreateWidget,
  ClientSchemaUpdateWidget,
  ClientSchemaDeleteWidget,
  ClientSchemaDuplicateWidget,
  ClientSchemaTransferWidget,
  ClientSchemaFileManagerWidget,
  ClientSchemaType
} from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaState {

  editor: Editor;

  private client: Client;

  get schema(): ClientSchema {
    return this.editor.entity as ClientSchema;
  }

  get schemaStore(): EntityStore<ClientSchema> {
    return this.editor.entityStore as EntityStore<ClientSchema>;
  }

  constructor(
    private clientSchemaTableService: ClientSchemaTableService,
    @Inject(ClientSchemaCreateWidget) private clientSchemaCreateWidget: Widget,
    @Inject(ClientSchemaUpdateWidget) private clientSchemaUpdateWidget: Widget,
    @Inject(ClientSchemaDeleteWidget) private clientSchemaDeleteWidget: Widget,
    @Inject(ClientSchemaDuplicateWidget) private clientSchemaDuplicateWidget: Widget,
    @Inject(ClientSchemaTransferWidget) private clientSchemaTransferWidget: Widget,
    @Inject(ClientSchemaFileManagerWidget) private clientSchemaFileManagerWidget: Widget,
  ) {
    this.editor = new Editor({
      id: 'fadq.client-schema-editor',
      title: 'Schémas du client',
      tableTemplate: clientSchemaTableService.buildTable(),
      entityStore: this.createStore(),
      actionStore: new ActionStore([])
    });

    this.editor.actionStore.load(this.buildActions());
  }

  setClient(client: Client) {
    this.client = client;

    if (client !== undefined) {
      this.schemaStore.load(client.schemas);
    } else {
      this.schemaStore.clear();
      this.editor.deactivate();
    }
  }

  private createStore(): EntityStore<ClientSchema> {
    const store = new EntityStore<ClientSchema>([]);
    store.view.sort({
      valueAccessor: (schema: ClientSchema) => schema.id,
      direction: 'desc'
    });

    return store;
  }

  private buildActions(): Action[] {
    const clientIsDefined = () => this.client !== undefined;
    const schemaIsDefined = () => this.schema !== undefined;
    const schemaIsOfTypeLSE = () => this.schema !== undefined && this.schema.type === ClientSchemaType.LSE;
    const schemaIsNotOfTypeLSE = () => this.schema !== undefined && this.schema.type !== ClientSchemaType.LSE;

    return [
      {
        id: 'create',
        icon: 'add',
        title: 'client.schema.create',
        tooltip: 'client.schema.create.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaCreateWidget, {
          schema: this.schema,
          client: this.client,
          store: this.schemaStore
        }),
        conditions: [clientIsDefined]
      },
      {
        id: 'update',
        icon: 'edit',
        title: 'client.schema.update',
        tooltip: 'client.schema.update.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaUpdateWidget, {
          schema: this.schema,
          client: this.client,
          store: this.schemaStore
        }),
        conditions: [schemaIsDefined]
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'client.schema.delete',
        tooltip: 'client.schema.delete.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaDeleteWidget, {
          schema: this.schema,
          client: this.client,
          store: this.schemaStore
        }),
        conditions: [schemaIsDefined]
      },
      {
        id: 'duplicate',
        icon: 'queue',
        title: 'client.schema.duplicate',
        tooltip: 'client.schema.duplicate.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaDuplicateWidget, {
          schema: this.schema,
          client: this.client,
          store: this.schemaStore
        }),
        conditions: [schemaIsDefined, schemaIsNotOfTypeLSE]
      },
      {
        id: 'manageFiles',
        icon: 'attach_file',
        title: 'client.schema.manageFiles',
        tooltip: 'client.schema.manageFiles.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaFileManagerWidget, {
          schema: this.schema
        }, {
          complete: (count: number) => {
            this.schemaStore.update(Object.assign({}, this.schema, {nbDocuments: count}));
          }
        }),
        conditions: [schemaIsDefined]
      },
      {
        id: 'transfer',
        icon: 'swap_horiz',
        title: 'client.schema.transfer',
        tooltip: 'client.schema.transfer.tooltip',
        handler: () => this.editor.activateWidget(this.clientSchemaTransferWidget, {
          schema: this.schema,
          client: this.client,
          store: this.schemaStore
        }),
        conditions: [schemaIsDefined, schemaIsOfTypeLSE]
      },
      {
        id: 'createMap',
        icon: 'image',
        title: 'client.schema.createMap',
        tooltip: 'client.schema.createMap.tooltip',
        handler: () => {},
        conditions: [schemaIsDefined, schemaIsOfTypeLSE, () => false]
      }
    ];
  }

}
