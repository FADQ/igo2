import { Inject, Injectable} from '@angular/core';

import { Action, Widget } from '@igo2/common';

import { ClientController } from '../../shared/controller';
import { ClientSchemaType } from '../../schema/shared/client-schema.enums';
import {
  ClientSchemaCreateWidget,
  ClientSchemaUpdateWidget,
  ClientSchemaDeleteWidget,
  ClientSchemaDuplicateWidget,
  ClientSchemaTransferWidget,
  ClientSchemaFileManagerWidget
} from './client-schema.widgets';

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

  buildActions(controller: ClientController): Action[] {

    function schemaIsDefined(ctrl: ClientController): boolean {
      return ctrl.schema !== undefined;
    }

    function schemaIsOfTypeLSE(ctrl: ClientController): boolean {
      return schemaIsDefined(ctrl) && ctrl.schema.type === ClientSchemaType.LSE;
    }

    function schemaIsNotOfTypeLSE(ctrl: ClientController): boolean {
      return schemaIsDefined(ctrl) && ctrl.schema.type !== ClientSchemaType.LSE;
    }

    const conditionArgs = [controller];

    return [
      {
        id: 'create',
        icon: 'plus',
        title: 'client.schema.create',
        tooltip: 'client.schema.create.tooltip',
        handler: function(widget: Widget, ctrl: ClientController) {
          ctrl.schemaWorkspace.activateWidget(widget, {
            client: ctrl.client,
            schema: ctrl.schema,
            store: ctrl.schemaWorkspace.entityStore
          });
        },
        args: [this.clientSchemaCreateWidget, controller]
      },
      {
        id: 'update',
        icon: 'pencil',
        title: 'client.schema.update',
        tooltip: 'client.schema.update.tooltip',
        handler: function(widget: Widget, ctrl: ClientController) {
          ctrl.schemaWorkspace.activateWidget(widget, {
            client: ctrl.client,
            schema: ctrl.schema,
            store: ctrl.schemaWorkspace.entityStore
          });
        },
        args: [this.clientSchemaUpdateWidget, controller],
        conditions: [schemaIsDefined],
        conditionArgs
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'client.schema.delete',
        tooltip: 'client.schema.delete.tooltip',
        handler: function(widget: Widget, ctrl: ClientController) {
          ctrl.schemaWorkspace.activateWidget(widget, {
            client: ctrl.client,
            schema: ctrl.schema,
            store: ctrl.schemaWorkspace.entityStore
          });
        },
        args: [this.clientSchemaDeleteWidget, controller],
        conditions: [schemaIsDefined],
        conditionArgs
      },
      {
        id: 'duplicate',
        icon: 'content-copy',
        title: 'client.schema.duplicate',
        tooltip: 'client.schema.duplicate.tooltip',
        handler: function(widget: Widget, ctrl: ClientController) {
          ctrl.schemaWorkspace.activateWidget(widget, {
            client: ctrl.client,
            schema: ctrl.schema,
            store: ctrl.schemaWorkspace.entityStore
          });
        },
        args: [this.clientSchemaDuplicateWidget, controller],
        conditions: [schemaIsNotOfTypeLSE],
        conditionArgs
      },
      {
        id: 'manageFiles',
        icon: 'paperclip',
        title: 'client.schema.manageFiles',
        tooltip: 'client.schema.manageFiles.tooltip',
        handler: function(widget: Widget, ctrl: ClientController) {
          ctrl.schemaWorkspace.activateWidget(widget, {schema: ctrl.schema}, {
            complete: (count: number) => {
              ctrl.schemaWorkspace.entityStore.update(Object.assign({}, ctrl.schema, {nbDocuments: count}));
            }
          });
        },
        args: [this.clientSchemaFileManagerWidget, controller],
        conditions: [schemaIsDefined],
        conditionArgs
      },
      {
        id: 'transfer',
        icon: 'swap-horizontal',
        title: 'client.schema.transfer',
        tooltip: 'client.schema.transfer.tooltip',
        handler: function(widget: Widget, ctrl: ClientController) {
          ctrl.schemaWorkspace.activateWidget(widget, {
            client: ctrl.client,
            schema: ctrl.schema,
            store: ctrl.schemaWorkspace.entityStore
          });
        },
        args: [this.clientSchemaTransferWidget, controller],
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
