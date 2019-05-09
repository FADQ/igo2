import { Inject, Injectable } from '@angular/core';

import { Action, EntityTableColumn, Widget } from '@igo2/common';
import { entitiesToRowData, exportToCSV } from '@igo2/geo';

import {
  ClientSchemaElementCreateWidget,
  ClientSchemaElementUpdateWidget,
  ClientSchemaElementReincludeWidget,
  ClientSchemaElementSliceWidget,
  ClientSchemaElementSaverWidget,
  ClientSchemaElementUndoWidget,
  ClientSchemaElementImportDataWidget,
  generateOperationTitle
} from 'src/lib/client';

import { ClientWorkspace } from './client-workspace';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementActionsService {

  constructor(
    @Inject(ClientSchemaElementCreateWidget) private clientSchemaElementCreateWidget: Widget,
    @Inject(ClientSchemaElementUpdateWidget) private clientSchemaElementUpdateWidget: Widget,
    @Inject(ClientSchemaElementReincludeWidget) private clientSchemaElementReincludeWidget: Widget,
    @Inject(ClientSchemaElementSliceWidget) private clientSchemaElementSliceWidget: Widget,
    @Inject(ClientSchemaElementSaverWidget) private clientSchemaElementSaverWidget: Widget,
    @Inject(ClientSchemaElementUndoWidget) private clientSchemaElementUndoWidget: Widget,
    @Inject(ClientSchemaElementImportDataWidget) private clientSchemaElementImportDataWidget: Widget
  ) {}

  loadSchemaElementActions(workspace: ClientWorkspace) {
    const actions = this.buildSchemaElementActions(workspace);
    workspace.schemaElementEditor.actionStore.load(actions);
  }

  private buildSchemaElementActions(workspace: ClientWorkspace): Action[] {

    function schemaIsDefined(ws: ClientWorkspace): boolean {
      return ws.schema !== undefined;
    }

    function elementIsDefined(ws: ClientWorkspace): boolean {
      return ws.element !== undefined;
    }

    function transactionIsNotEmpty(ws: ClientWorkspace): boolean {
      return ws.transaction.empty === false;
    };
  
    function transactionIsNotInCommitPhase(ws: ClientWorkspace): boolean {
      return ws.transaction.inCommitPhase === false;
    };
  
    function elementIsAPolygon(ws: ClientWorkspace): boolean {
      const element = ws.element;
      const geometry = element === undefined ? undefined : element.geometry;
      return geometry !== undefined && geometry.type === 'Polygon';
    };
  
    function elementCanBeFilled(ws: ClientWorkspace): boolean {
      const element = ws.element;
      const geometry = element === undefined ? undefined : element.geometry;
      return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length > 1;
    };

    const conditionArgs = [workspace];

    return [
      {
        id: 'create',
        icon: 'add',
        title: 'client.schemaElement.create',
        tooltip: 'client.schemaElement.create.tooltip',
        handler: (widget: Widget, ws: ClientWorkspace) => {
          ws.schemaElementEditor.activateWidget(widget, {
            schema: ws.schema,
            transaction: ws.transaction,
            map: ws.map,
            store: ws.schemaElementStore
          });
        },
        args: [this.clientSchemaElementCreateWidget, workspace],
        conditions: [schemaIsDefined],
        conditionArgs
      },
      {
        id: 'update',
        icon: 'edit',
        title: 'client.schemaElement.update',
        tooltip: 'client.schemaElement.update.tooltip',
        handler: (widget: Widget, ws: ClientWorkspace) => {
          ws.schemaElementEditor.activateWidget(widget, {
            element: ws.element,
            schema: ws.schema,
            transaction: ws.transaction,
            map: ws.map,
            store: ws.schemaElementStore
          });
        },
        args: [this.clientSchemaElementUpdateWidget, workspace],
        conditions: [schemaIsDefined, elementIsDefined, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'client.schemaElement.delete',
        tooltip: 'client.schemaElement.delete.tooltip',
        handler: (ws: ClientWorkspace) => {
          ws.transaction.delete(ws.element, ws.schemaElementStore, {
            title: generateOperationTitle(ws.element)
          });
        },
        args: [workspace],
        conditions: [elementIsDefined, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'reinclude',
        icon: 'select_all',
        title: 'client.schemaElement.reinclude',
        tooltip: 'client.schemaElement.reinclude.tooltip',
        handler: (widget: Widget, ws: ClientWorkspace) => {
          ws.schemaElementEditor.activateWidget(widget, {
            element: ws.element,
            schema: ws.schema,
            transaction: ws.transaction,
            map: ws.map,
            store: ws.schemaElementStore
          });
        },
        args: [this.clientSchemaElementReincludeWidget, workspace],
        conditions: [elementIsDefined, transactionIsNotInCommitPhase, elementCanBeFilled],
        conditionArgs
      },
      {
        id: 'slice',
        icon: 'flip',
        title: 'client.schemaElement.slice',
        tooltip: 'client.schemaElement.slice.tooltip',
        handler: (widget: Widget, ws: ClientWorkspace) => {
          ws.schemaElementEditor.activateWidget(widget, {
            element: ws.element,
            schema: ws.schema,
            transaction: ws.transaction,
            map: ws.map,
            store: ws.schemaElementStore
          });
        },
        args: [this.clientSchemaElementSliceWidget, workspace],
        conditions: [elementIsDefined, transactionIsNotInCommitPhase, elementIsAPolygon],
        conditionArgs
      },
      {
        id: 'save',
        icon: 'save',
        title: 'client.schemaElement.save',
        tooltip: 'client.schemaElement.save.tooltip',
        handler: (widget: Widget, ws: ClientWorkspace) => {
          ws.schemaElementEditor.activateWidget(widget, {
            schema: ws.schema,
            transaction: ws.transaction,
            store: ws.schemaElementStore
          });
        },
        args: [this.clientSchemaElementSaverWidget, workspace],
        conditions: [elementIsDefined, transactionIsNotInCommitPhase, transactionIsNotEmpty],
        conditionArgs
      },
      {
        id: 'undo',
        icon: 'undo',
        title: 'client.schemaElement.undo',
        tooltip: 'client.schemaElement.undo.tooltip',
        handler: (widget: Widget, ws: ClientWorkspace) => {
          ws.schemaElementEditor.activateWidget(widget, {
            transaction: ws.transaction
          });
        },
        args: [this.clientSchemaElementUndoWidget, workspace],
        conditions: [elementIsDefined, transactionIsNotInCommitPhase, transactionIsNotEmpty],
        conditionArgs
      },
      {
        id: 'importData',
        icon: 'input',
        title: 'client.schemaElement.importData',
        tooltip: 'client.schemaElement.importData.tooltip',
        handler: (widget: Widget, ws: ClientWorkspace) => {
          ws.schemaElementEditor.activateWidget(widget, {
            element: ws.element,
            schema: ws.schema,
            transaction: ws.transaction,
            map: ws.map,
            store: ws.schemaElementStore
          });
        },
        args: [this.clientSchemaElementImportDataWidget, workspace],
        conditions: [elementIsDefined, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'export',
        icon: 'file_download',
        title: 'client.schemaElement.exportToCSV',
        tooltip: 'client.schemaElement.exportToCSV.tooltip',
        handler: (ws: ClientWorkspace) => {
          const editor = ws.schemaElementEditor;
          const columns = editor.tableTemplate.columns;
          const headers = columns.map((column: EntityTableColumn) => column.title);
          const rows = entitiesToRowData(editor.entityStore.view.all(), columns);

          const fileName = `Éléments du schéma ${ws.schema.id}.csv`;
          exportToCSV([headers].concat(rows), fileName, ';');
        },
        args: [workspace]
      }
    ];
  }

}
