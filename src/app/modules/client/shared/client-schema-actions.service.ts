import { Inject, Injectable} from '@angular/core';

import { Action, Widget } from '@igo2/common';

import {
  ClientSchemaCreateWidget,
  ClientSchemaUpdateWidget,
  ClientSchemaDeleteWidget,
  ClientSchemaDuplicateWidget,
  ClientSchemaTransferWidget,
  ClientSchemaFileManagerWidget,
  ClientSchemaType
} from 'src/lib/client';

import { ClientWorkspace } from './client-workspace';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaActionsService {

  constructor(
    @Inject(ClientSchemaCreateWidget) private clientSchemaCreateWidget: Widget,
    @Inject(ClientSchemaUpdateWidget) private clientSchemaUpdateWidget: Widget,
    @Inject(ClientSchemaDeleteWidget) private clientSchemaDeleteWidget: Widget,
    @Inject(ClientSchemaDuplicateWidget) private clientSchemaDuplicateWidget: Widget,
    @Inject(ClientSchemaTransferWidget) private clientSchemaTransferWidget: Widget,
    @Inject(ClientSchemaFileManagerWidget) private clientSchemaFileManagerWidget: Widget
  ) {}

  loadSchemaActions(workspace: ClientWorkspace) {
    const actions = this.buildSchemaActions(workspace);
    workspace.schemaEditor.actionStore.load(actions);
  }

  private buildSchemaActions(workspace: ClientWorkspace): Action[] {

    function schemaIsDefined(ws: ClientWorkspace): boolean {
      return ws.schema !== undefined;
    }

    function schemaIsOfTypeLSE(ws: ClientWorkspace): boolean {
      return schemaIsDefined(ws) && ws.schema.type === ClientSchemaType.LSE;
    }

    function schemaIsNotOfTypeLSE(ws: ClientWorkspace): boolean {
      return schemaIsDefined(ws) && ws.schema.type !== ClientSchemaType.LSE;
    }

    const conditionArgs = [workspace];

    return [
      {
        id: 'create',
        icon: 'add',
        title: 'client.schema.create',
        tooltip: 'client.schema.create.tooltip',
        handler: function(widget: Widget, ws: ClientWorkspace) {
          ws.schemaEditor.activateWidget(widget, {
            client: ws.client,
            schema: ws.schema,
            store: ws.schemaEditor.entityStore
          });
        },
        args: [this.clientSchemaCreateWidget, workspace]
      },
      {
        id: 'update',
        icon: 'edit',
        title: 'client.schema.update',
        tooltip: 'client.schema.update.tooltip',
        handler: function(widget: Widget, ws: ClientWorkspace) {
          ws.schemaEditor.activateWidget(widget, {
            client: ws.client,
            schema: ws.schema,
            store: ws.schemaEditor.entityStore
          });
        },
        args: [this.clientSchemaUpdateWidget, workspace],
        conditions: [schemaIsDefined],
        conditionArgs
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'client.schema.delete',
        tooltip: 'client.schema.delete.tooltip',
        handler: function(widget: Widget, ws: ClientWorkspace) {
          ws.schemaEditor.activateWidget(widget, {
            client: ws.client,
            schema: ws.schema,
            store: ws.schemaEditor.entityStore
          });
        },
        args: [this.clientSchemaDeleteWidget, workspace],
        conditions: [schemaIsDefined],
        conditionArgs
      },
      {
        id: 'duplicate',
        icon: 'queue',
        title: 'client.schema.duplicate',
        tooltip: 'client.schema.duplicate.tooltip',
        handler: function(widget: Widget, ws: ClientWorkspace) {
          ws.schemaEditor.activateWidget(widget, {
            client: ws.client,
            schema: ws.schema,
            store: ws.schemaEditor.entityStore
          });
        },
        args: [this.clientSchemaDuplicateWidget, workspace],
        conditions: [schemaIsNotOfTypeLSE],
        conditionArgs
      },
      {
        id: 'manageFiles',
        icon: 'attach_file',
        title: 'client.schema.manageFiles',
        tooltip: 'client.schema.manageFiles.tooltip',
        handler: function(widget: Widget, ws: ClientWorkspace) {
          ws.schemaEditor.activateWidget(widget, {schema: ws.schema}, {
            complete: (count: number) => {
              ws.schemaEditor.entityStore.update(Object.assign({}, ws.schema, {nbDocuments: count}));
            }
          });
        },
        args: [this.clientSchemaFileManagerWidget, workspace],
        conditions: [schemaIsDefined],
        conditionArgs
      },
      {
        id: 'transfer',
        icon: 'swap_horiz',
        title: 'client.schema.transfer',
        tooltip: 'client.schema.transfer.tooltip',
        handler: function(widget: Widget, ws: ClientWorkspace) {
          ws.schemaEditor.activateWidget(widget, {
            client: ws.client,
            schema: ws.schema,
            store: ws.schemaEditor.entityStore
          });
        },
        args: [this.clientSchemaTransferWidget, workspace],
        conditions: [schemaIsOfTypeLSE],
        conditionArgs
      },
      {
        id: 'createMap',
        icon: 'image',
        title: 'client.schema.createMap',
        tooltip: 'client.schema.createMap.tooltip',
        handler: function() {},
        conditions: [schemaIsDefined, () => false],
        conditionArgs
      }
    ];
  }

}
