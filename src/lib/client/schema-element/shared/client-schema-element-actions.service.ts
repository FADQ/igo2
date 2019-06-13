import { Inject, Injectable } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { Action, EntityTableColumn, Widget } from '@igo2/common';
import { entitiesToRowData, exportToCSV } from '@igo2/geo';

import { EditionUndoWidget } from '../../../edition/shared/edition.widgets';

import { ClientController } from '../../shared/controller';
import { ClientSchemaElement } from './client-schema-element.interfaces';
import {
  ClientSchemaElementCreateWidget,
  ClientSchemaElementUpdateWidget,
  ClientSchemaElementUpdateBatchWidget,
  ClientSchemaElementFillWidget,
  ClientSchemaElementSliceWidget,
  ClientSchemaElementSaveWidget,
  ClientSchemaElementImportWidget,
} from './client-schema-element.widgets';
import { generateSchemaElementOperationTitle } from './client-schema-element.utils';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementActionsService {

  constructor(
    @Inject(ClientSchemaElementCreateWidget) private clientSchemaElementCreateWidget: Widget,
    @Inject(ClientSchemaElementUpdateWidget) private clientSchemaElementUpdateWidget: Widget,
    @Inject(ClientSchemaElementUpdateBatchWidget) private clientSchemaElementUpdateBatchWidget: Widget,
    @Inject(ClientSchemaElementFillWidget) private clientSchemaElementFillWidget: Widget,
    @Inject(ClientSchemaElementSliceWidget) private clientSchemaElementSliceWidget: Widget,
    @Inject(ClientSchemaElementSaveWidget) private clientSchemaElementSaveWidget: Widget,
    @Inject(EditionUndoWidget) private editionUndoWidget: Widget,
    @Inject(ClientSchemaElementImportWidget) private clientSchemaElementImportWidget: Widget,
    private languageService: LanguageService
  ) {}

  buildActions(controller: ClientController): Action[] {

    function schemaIsDefined(ctrl: ClientController): boolean {
      return ctrl.schema !== undefined;
    }

    function oneSchemaElementIsActive(ctrl: ClientController): boolean {
      return ctrl.activeSchemaElement !== undefined;
    }

    function oneOrMoreSchemaElementAreSelected(ctrl: ClientController): boolean {
      return ctrl.selectedSchemaElements.length > 0;
    }

    function transactionIsNotEmpty(ctrl: ClientController): boolean {
      return ctrl.schemaElementTransaction.empty === false;
    }

    function transactionIsNotInCommitPhase(ctrl: ClientController): boolean {
      return ctrl.schemaElementTransaction.inCommitPhase === false;
    }

    function schemaElementCanBeFilled(ctrl: ClientController): boolean {
      const schemaElement = ctrl.activeSchemaElement;
      const geometry = schemaElement === undefined ? undefined : schemaElement.geometry;
      return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length > 1;
    }

    function schemaElementCanBeSliced(ctrl: ClientController): boolean {
      const schemaElement = ctrl.activeSchemaElement;
      const geometry = schemaElement === undefined ? undefined : schemaElement.geometry;
      return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length === 1;
    }

    const conditionArgs = [controller];

    return [
      {
        id: 'create',
        icon: 'plus',
        title: 'edition.create',
        tooltip: 'edition.create.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          });
        },
        args: [this.clientSchemaElementCreateWidget, controller],
        conditions: [schemaIsDefined],
        conditionArgs
      },
      {
        id: 'update',
        icon: 'pencil',
        title: 'edition.update',
        tooltip: 'edition.update.tooltip',
        handler: (singleWidget: Widget, batchWidget: Widget, ctrl: ClientController) => {
          const inputs = {
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          };

          if (ctrl.activeSchemaElement !== undefined) {
            ctrl.schemaElementWorkspace.activateWidget(singleWidget, Object.assign({
              schemaElement: ctrl.activeSchemaElement
            }, inputs));
          } else {
            ctrl.schemaElementWorkspace.activateWidget(batchWidget, Object.assign({
              schemaElements: ctrl.selectedSchemaElements
            }, inputs));
          }
        },
        args: [
          this.clientSchemaElementUpdateWidget,
          this.clientSchemaElementUpdateBatchWidget,
          controller
        ],
        conditions: [oneOrMoreSchemaElementAreSelected, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'edition.delete',
        tooltip: 'edition.delete.tooltip',
        handler: (ctrl: ClientController) => {
          const store = ctrl.schemaElementStore;
          const transaction = ctrl.schemaElementTransaction;
          const schemaElements = ctrl.selectedSchemaElements;
          schemaElements.forEach((schemaElement: ClientSchemaElement) => {
            transaction.delete(schemaElement, store, {
              title: generateSchemaElementOperationTitle(schemaElement, this.languageService)
            });
          });
        },
        args: [controller],
        conditions: [oneOrMoreSchemaElementAreSelected, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'fill',
        icon: 'select-all',
        title: 'edition.fill',
        tooltip: 'edition.fill.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schemaElement: ctrl.activeSchemaElement,
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          });
        },
        args: [this.clientSchemaElementFillWidget, controller],
        conditions: [oneSchemaElementIsActive, transactionIsNotInCommitPhase, schemaElementCanBeFilled],
        conditionArgs
      },
      {
        id: 'slice',
        icon: 'box-cutter',
        title: 'edition.slice',
        tooltip: 'edition.slice.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schemaElement: ctrl.activeSchemaElement,
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          });
        },
        args: [this.clientSchemaElementSliceWidget, controller],
        conditions: [oneSchemaElementIsActive, transactionIsNotInCommitPhase, schemaElementCanBeSliced],
        conditionArgs
      },
      {
        id: 'save',
        icon: 'floppy',
        title: 'edition.save',
        tooltip: 'edition.save.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            store: ctrl.schemaElementStore
          });
        },
        args: [this.clientSchemaElementSaveWidget, controller],
        conditions: [transactionIsNotInCommitPhase, transactionIsNotEmpty],
        conditionArgs
      },
      {
        id: 'undo',
        icon: 'undo',
        title: 'edition.undo',
        tooltip: 'edition.undo.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            transaction: ctrl.schemaElementTransaction
          });
        },
        args: [this.editionUndoWidget, controller],
        conditions: [transactionIsNotInCommitPhase, transactionIsNotEmpty],
        conditionArgs
      },
      {
        id: 'importData',
        icon: 'import',
        title: 'client.schemaElement.importData',
        tooltip: 'client.schemaElement.importData.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schemaElement: ctrl.activeSchemaElement,
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          });
        },
        args: [this.clientSchemaElementImportWidget, controller],
        conditions: [transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'export',
        icon: 'file-download',
        title: 'edition.exportToCSV',
        tooltip: 'edition.exportToCSV.tooltip',
        handler: (ctrl: ClientController) => {
          const workspace = ctrl.schemaElementWorkspace;
          const columns = workspace.meta.tableTemplate.columns;
          const headers = columns.map((column: EntityTableColumn) => column.title);
          const rows = entitiesToRowData(workspace.entityStore.view.all(), columns);

          const fileName = `Éléments du schéma ${ctrl.schema.id}.csv`;
          exportToCSV([headers].concat(rows), fileName, ';');
        },
        args: [controller]
      }
    ];
  }

}
