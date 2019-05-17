import { Inject, Injectable } from '@angular/core';

import { Action, Widget } from '@igo2/common';

import {
  ClientWorkspace,
  ClientSchemaParcelCreateWidget,
  ClientSchemaParcelUpdateWidget,
  ClientSchemaParcelTransferFormWidget
} from 'src/lib/client';

import { ClientSchemaElementActionsService } from './client-schema-element-actions.service';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaParcelActionsService {

  constructor(
    private clientSchemaElementActionsService: ClientSchemaElementActionsService,
    @Inject(ClientSchemaParcelCreateWidget) private clientSchemaParcelCreateWidget: Widget,
    @Inject(ClientSchemaParcelUpdateWidget) private clientSchemaParcelUpdateWidget: Widget,
    @Inject(ClientSchemaParcelTransferFormWidget) private clientSchemaParcelTransferFormWidget: Widget
  ) {}

  buildActions(workspace: ClientWorkspace): Action[] {
    const actions = this.clientSchemaElementActionsService.buildActions(workspace);

    const createAction = actions.find((action: Action) => action.id === 'create');
    createAction.args = [this.clientSchemaParcelCreateWidget, workspace];

    const updateAction = actions.find((action: Action) => action.id === 'update');
    updateAction.args = [this.clientSchemaParcelUpdateWidget, workspace];

    function transactionIsNotInCommitPhase(ws: ClientWorkspace): boolean {
      return ws.transaction.inCommitPhase === false;
    }

    const conditionArgs = [workspace];

    const extraActions = [
      {
        id: 'transfer',
        icon: 'swap_horiz',
        title: 'client.schemaParcel.transfer',
        tooltip: 'client.schemaParcel.transfer.tooltip',
        handler: (widget: Widget, ws: ClientWorkspace) => {
          ws.schemaElementEditor.activateWidget(widget, {
            client: workspace.client,
            schema: ws.schema,
            map: ws.map,
            store: ws.schemaElementStore
          });
        },
        args: [this.clientSchemaParcelTransferFormWidget, workspace],
        conditions: [transactionIsNotInCommitPhase],
        conditionArgs
      }
    ]

    return actions.concat(extraActions);
  }

}
