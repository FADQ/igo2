import { Inject, Injectable } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { Action, EntityTableColumn, Widget } from '@igo2/common';
import { entitiesToRowData, exportToCSV } from '@igo2/geo';

import {
  ClientWorkspace,
  ClientSchemaElementCreateWidget,
  ClientSchemaElementUpdateWidget,
  ClientSchemaElementFillWidget,
  ClientSchemaElementSliceWidget,
  ClientSchemaElementSaveWidget,
  ClientSchemaElementImportWidget,
  generateSchemaElementOperationTitle
} from 'src/lib/client';
import { EditionUndoWidget } from 'src/lib/edition';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementActionsService {

  constructor(
    @Inject(ClientSchemaElementCreateWidget) private clientSchemaElementCreateWidget: Widget,
    @Inject(ClientSchemaElementUpdateWidget) private clientSchemaElementUpdateWidget: Widget,
    @Inject(ClientSchemaElementFillWidget) private clientSchemaElementFillWidget: Widget,
    @Inject(ClientSchemaElementSliceWidget) private clientSchemaElementSliceWidget: Widget,
    @Inject(ClientSchemaElementSaveWidget) private clientSchemaElementSaveWidget: Widget,
    @Inject(EditionUndoWidget) private editionUndoWidget: Widget,
    @Inject(ClientSchemaElementImportWidget) private clientSchemaElementImportWidget: Widget,
    private languageService: LanguageService
  ) {}

  buildActions(workspace: ClientWorkspace): Action[] {

    function schemaIsDefined(ws: ClientWorkspace): boolean {
      return ws.schema !== undefined;
    }

    function elementIsDefined(ws: ClientWorkspace): boolean {
      return ws.schemaElement !== undefined;
    }

    function transactionIsNotEmpty(ws: ClientWorkspace): boolean {
      return ws.transaction.empty === false;
    }

    function transactionIsNotInCommitPhase(ws: ClientWorkspace): boolean {
      return ws.transaction.inCommitPhase === false;
    }

    function elementIsAPolygon(ws: ClientWorkspace): boolean {
      const element = ws.schemaElement;
      const geometry = element === undefined ? undefined : element.geometry;
      return geometry !== undefined && geometry.type === 'Polygon';
    }

    function elementCanBeFilled(ws: ClientWorkspace): boolean {
      const element = ws.schemaElement;
      const geometry = element === undefined ? undefined : element.geometry;
      return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length > 1;
    }

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
            element: ws.schemaElement,
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
          ws.transaction.delete(ws.schemaElement, ws.schemaElementStore, {
            title: generateSchemaElementOperationTitle(ws.schemaElement, this.languageService)
          });
        },
        args: [workspace],
        conditions: [elementIsDefined, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'fill',
        icon: 'select_all',
        title: 'client.schemaElement.fill',
        tooltip: 'client.schemaElement.fill.tooltip',
        handler: (widget: Widget, ws: ClientWorkspace) => {
          ws.schemaElementEditor.activateWidget(widget, {
            element: ws.schemaElement,
            schema: ws.schema,
            transaction: ws.transaction,
            map: ws.map,
            store: ws.schemaElementStore
          });
        },
        args: [this.clientSchemaElementFillWidget, workspace],
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
            element: ws.schemaElement,
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
        args: [this.clientSchemaElementSaveWidget, workspace],
        conditions: [transactionIsNotInCommitPhase, transactionIsNotEmpty],
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
        args: [this.editionUndoWidget, workspace],
        conditions: [transactionIsNotInCommitPhase, transactionIsNotEmpty],
        conditionArgs
      },
      {
        id: 'importData',
        icon: 'input',
        title: 'client.schemaElement.importData',
        tooltip: 'client.schemaElement.importData.tooltip',
        handler: (widget: Widget, ws: ClientWorkspace) => {
          ws.schemaElementEditor.activateWidget(widget, {
            element: ws.schemaElement,
            schema: ws.schema,
            transaction: ws.transaction,
            map: ws.map,
            store: ws.schemaElementStore
          });
        },
        args: [this.clientSchemaElementImportWidget, workspace],
        conditions: [transactionIsNotInCommitPhase],
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
