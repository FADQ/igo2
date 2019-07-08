import { Inject, Injectable} from '@angular/core';

import { Action, Widget } from '@igo2/common';

import { ClientController } from '../../shared/controller';
import { ClientSchemaType, ClientSchemaEtat } from '../../schema/shared/client-schema.enums';
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

    function noActiveWidget(ctrl: ClientController): boolean {
      return !ctrl.schemaWorkspace.hasWidget;
    }

    function schemaIsDefined(ctrl: ClientController): boolean {
      return ctrl.schema !== undefined;
    }

    function schemaIsOfTypeLSE(ctrl: ClientController): boolean {
      return schemaIsDefined(ctrl) && ctrl.schema.type === ClientSchemaType.LSE;
    }

    function schemaCanBeDuplicated(ctrl: ClientController): boolean {
      return schemaIsDefined(ctrl) &&
        !schemaIsOfTypeLSE(ctrl) &&
        ctrl.schema.etat !== ClientSchemaEtat.ENTRAI &&
        ctrl.schema.etat !== ClientSchemaEtat.VALIDE;
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
        args: [this.clientSchemaCreateWidget, controller],
        conditions: [noActiveWidget],
        conditionArgs
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
        conditions: [noActiveWidget, schemaIsDefined],
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
        conditions: [noActiveWidget, schemaIsDefined],
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
        conditions: [noActiveWidget, schemaCanBeDuplicated],
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
        conditions: [noActiveWidget, schemaIsDefined],
        conditionArgs
      },
      {
        id: 'transfer',
        icon: 'account-switch',
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
        conditions: [noActiveWidget, schemaIsOfTypeLSE],
        conditionArgs
      },
      {
        id: 'createMap',
        icon: 'image',
        title: 'client.schema.createMap',
        tooltip: 'client.schema.createMap.tooltip',
        handler: function() {},
        conditions: [noActiveWidget, schemaIsDefined, () => false],
        conditionArgs
      }
    ];
  }

}
