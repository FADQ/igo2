import { Inject, Injectable } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { Action, EntityTableColumn, Widget } from '@igo2/common';
import { entitiesToRowData, exportToCSV } from '@igo2/geo';

import { EditionUndoWidget } from '../../../edition/shared/edition.widgets';

import { ClientController } from '../../shared/controller';
import {
  ClientSchemaElementCreateWidget,
  ClientSchemaElementUpdateWidget,
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
    @Inject(ClientSchemaElementFillWidget) private clientSchemaElementFillWidget: Widget,
    @Inject(ClientSchemaElementSliceWidget) private clientSchemaElementSliceWidget: Widget,
    @Inject(ClientSchemaElementSaveWidget) private clientSchemaElementSaveWidget: Widget,
    @Inject(EditionUndoWidget) private editionUndoWidget: Widget,
    @Inject(ClientSchemaElementImportWidget) private clientSchemaElementImportWidget: Widget,
    private languageService: LanguageService
  ) {}

  buildActions(controller: ClientController): Action[] {

    function schemaIsDefined(controller: ClientController): boolean {
      return controller.schema !== undefined;
    }

    function schemaElementIsDefined(controller: ClientController): boolean {
      return controller.schemaElement !== undefined;
    }

    function transactionIsNotEmpty(controller: ClientController): boolean {
      return controller.transaction.empty === false;
    }

    function transactionIsNotInCommitPhase(controller: ClientController): boolean {
      return controller.transaction.inCommitPhase === false;
    }

    function schemaElementIsAPolygon(controller: ClientController): boolean {
      const schemaElement = controller.schemaElement;
      const geometry = schemaElement === undefined ? undefined : schemaElement.geometry;
      return geometry !== undefined && geometry.type === 'Polygon';
    }

    function schemaElementCanBeFilled(controller: ClientController): boolean {
      const schemaElement = controller.schemaElement;
      const geometry = schemaElement === undefined ? undefined : schemaElement.geometry;
      return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length > 1;
    }

    const conditionArgs = [controller];

    return [
      {
        id: 'create',
        icon: 'add',
        title: 'edition.create',
        tooltip: 'edition.create.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.schemaElementWorkspace.activateWidget(widget, {
            schema: controller.schema,
            transaction: controller.transaction,
            map: controller.map,
            store: controller.schemaElementStore
          });
        },
        args: [this.clientSchemaElementCreateWidget, controller],
        conditions: [schemaIsDefined],
        conditionArgs
      },
      {
        id: 'update',
        icon: 'edit',
        title: 'edition.update',
        tooltip: 'edition.update.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.schemaElementWorkspace.activateWidget(widget, {
            schemaElement: controller.schemaElement,
            schema: controller.schema,
            transaction: controller.transaction,
            map: controller.map,
            store: controller.schemaElementStore
          });
        },
        args: [this.clientSchemaElementUpdateWidget, controller],
        conditions: [schemaIsDefined, schemaElementIsDefined, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'edition.delete',
        tooltip: 'edition.delete.tooltip',
        handler: (controller: ClientController) => {
          controller.transaction.delete(controller.schemaElement, controller.schemaElementStore, {
            title: generateSchemaElementOperationTitle(controller.schemaElement, this.languageService)
          });
        },
        args: [controller],
        conditions: [schemaElementIsDefined, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'fill',
        icon: 'select_all',
        title: 'edition.fill',
        tooltip: 'edition.fill.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.schemaElementWorkspace.activateWidget(widget, {
            schemaElement: controller.schemaElement,
            schema: controller.schema,
            transaction: controller.transaction,
            map: controller.map,
            store: controller.schemaElementStore
          });
        },
        args: [this.clientSchemaElementFillWidget, controller],
        conditions: [schemaElementIsDefined, transactionIsNotInCommitPhase, schemaElementCanBeFilled],
        conditionArgs
      },
      {
        id: 'slice',
        icon: 'flip',
        title: 'edition.slice',
        tooltip: 'edition.slice.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.schemaElementWorkspace.activateWidget(widget, {
            schemaElement: controller.schemaElement,
            schema: controller.schema,
            transaction: controller.transaction,
            map: controller.map,
            store: controller.schemaElementStore
          });
        },
        args: [this.clientSchemaElementSliceWidget, controller],
        conditions: [schemaElementIsDefined, transactionIsNotInCommitPhase, schemaElementIsAPolygon],
        conditionArgs
      },
      {
        id: 'save',
        icon: 'save',
        title: 'edition.save',
        tooltip: 'edition.save.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.schemaElementWorkspace.activateWidget(widget, {
            schema: controller.schema,
            transaction: controller.transaction,
            store: controller.schemaElementStore
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
        handler: (widget: Widget, controller: ClientController) => {
          controller.schemaElementWorkspace.activateWidget(widget, {
            transaction: controller.transaction
          });
        },
        args: [this.editionUndoWidget, controller],
        conditions: [transactionIsNotInCommitPhase, transactionIsNotEmpty],
        conditionArgs
      },
      {
        id: 'importData',
        icon: 'input',
        title: 'client.schemaElement.importData',
        tooltip: 'client.schemaElement.importData.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.schemaElementWorkspace.activateWidget(widget, {
            schemaElement: controller.schemaElement,
            schema: controller.schema,
            transaction: controller.transaction,
            map: controller.map,
            store: controller.schemaElementStore
          });
        },
        args: [this.clientSchemaElementImportWidget, controller],
        conditions: [transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'export',
        icon: 'file_download',
        title: 'edition.exportToCSV',
        tooltip: 'edition.exportToCSV.tooltip',
        handler: (controller: ClientController) => {
          const workspace = controller.schemaElementWorkspace;
          const columns = workspace.meta.tableTemplate.columns;
          const headers = columns.map((column: EntityTableColumn) => column.title);
          const rows = entitiesToRowData(workspace.entityStore.view.all(), columns);

          const fileName = `Éléments du schéma ${controller.schema.id}.csv`;
          exportToCSV([headers].concat(rows), fileName, ';');
        },
        args: [controller]
      }
    ];
  }

}
