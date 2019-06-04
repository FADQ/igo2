import { Inject, Injectable } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { Action, Widget } from '@igo2/common';

import { EditionUndoWidget } from '../../../edition/shared/edition.widgets';

import { ClientController } from '../../shared/controller';
import {
  ClientParcelElementCreateWidget,
  ClientParcelElementUpdateWidget,
  ClientParcelElementFillWidget,
  ClientParcelElementSliceWidget,
  ClientParcelElementSaveWidget,
  ClientParcelElementImportWidget,
  ClientParcelElementTransferWidget
} from './client-parcel-element.widgets';
import { generateParcelElementOperationTitle } from './client-parcel-element.utils';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelElementActionsService {

  constructor(
    @Inject(ClientParcelElementCreateWidget) private clientParcelElementCreateWidget: Widget,
    @Inject(ClientParcelElementUpdateWidget) private clientParcelElementUpdateWidget: Widget,
    @Inject(ClientParcelElementFillWidget) private clientParcelElementFillWidget: Widget,
    @Inject(ClientParcelElementSliceWidget) private clientParcelElementSliceWidget: Widget,
    @Inject(ClientParcelElementSaveWidget) private clientParcelElementSaveWidget: Widget,
    @Inject(EditionUndoWidget) private editionUndoWidget: Widget,
    @Inject(ClientParcelElementImportWidget) private clientParcelElementImportWidget: Widget,
    @Inject(ClientParcelElementTransferWidget) private clientParcelElementTransferWidget: Widget,
    private languageService: LanguageService
  ) {}

  buildActions(controller: ClientController): Action[] {

    function parcelElementIsDefined(controller: ClientController): boolean {
      return controller.parcelElement !== undefined;
    }

    function transactionIsNotEmpty(controller: ClientController): boolean {
      return controller.transaction.empty === false;
    }

    function transactionIsNotInCommitPhase(controller: ClientController): boolean {
      return controller.transaction.inCommitPhase === false;
    }

    function parcelElementCanBeFilled(controller: ClientController): boolean {
      const parcelElement = controller.parcelElement;
      const geometry = parcelElement === undefined ? undefined : parcelElement.geometry;
      return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length > 1;
    }

    const conditionArgs = [controller];

    return [
      {
        id: 'stopEdition',
        icon: 'block',
        title: 'client.parcel.stopEdition',
        tooltip: 'client.parcel.stopEdition.tooltip',
        handler: function(controller: ClientController) {
          controller.stopParcelEdition();
        },
        args: [controller]
      },
      {
        id: 'create',
        icon: 'add',
        title: 'edition.create',
        tooltip: 'edition.create.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.parcelElementWorkspace.activateWidget(widget, {
            transaction: controller.transaction,
            map: controller.map,
            store: controller.parcelElementStore
          });
        },
        args: [this.clientParcelElementCreateWidget, controller],
        conditions: [],
        conditionArgs
      },
      {
        id: 'update',
        icon: 'edit',
        title: 'edition.update',
        tooltip: 'edition.update.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.parcelElementWorkspace.activateWidget(widget, {
            parcelElement: controller.parcelElement,
            transaction: controller.transaction,
            map: controller.map,
            store: controller.parcelElementStore
          });
        },
        args: [this.clientParcelElementUpdateWidget, controller],
        conditions: [parcelElementIsDefined, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'edition.delete',
        tooltip: 'edition.delete.tooltip',
        handler: (controller: ClientController) => {
          controller.transaction.delete(controller.parcelElement, controller.parcelElementStore, {
            title: generateParcelElementOperationTitle(controller.parcelElement, this.languageService)
          });
        },
        args: [controller],
        conditions: [parcelElementIsDefined, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'fill',
        icon: 'select_all',
        title: 'edition.fill',
        tooltip: 'edition.fill.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.parcelElementWorkspace.activateWidget(widget, {
            parcelElement: controller.parcelElement,
            transaction: controller.transaction,
            map: controller.map,
            store: controller.parcelElementStore
          });
        },
        args: [this.clientParcelElementFillWidget, controller],
        conditions: [parcelElementIsDefined, transactionIsNotInCommitPhase, parcelElementCanBeFilled],
        conditionArgs
      },
      {
        id: 'slice',
        icon: 'flip',
        title: 'edition.slice',
        tooltip: 'edition.slice.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.parcelElementWorkspace.activateWidget(widget, {
            parcelElement: controller.parcelElement,
            transaction: controller.transaction,
            map: controller.map,
            store: controller.parcelElementStore
          });
        },
        args: [this.clientParcelElementSliceWidget, controller],
        conditions: [parcelElementIsDefined, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'save',
        icon: 'save',
        title: 'edition.save',
        tooltip: 'edition.save.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.parcelElementWorkspace.activateWidget(widget, {
            transaction: controller.transaction,
            store: controller.parcelElementStore
          });
        },
        args: [this.clientParcelElementSaveWidget, controller],
        conditions: [transactionIsNotInCommitPhase, transactionIsNotEmpty],
        conditionArgs
      },
      {
        id: 'undo',
        icon: 'undo',
        title: 'edition.undo',
        tooltip: 'edition.undo.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.parcelElementWorkspace.activateWidget(widget, {
            transaction: controller.transaction
          });
        },
        args: [this.editionUndoWidget, controller],
        conditions: [transactionIsNotInCommitPhase, transactionIsNotEmpty],
        conditionArgs
      },
      {
        id: 'transfer',
        icon: 'swap_horiz',
        title: 'client.parcelElement.transfer',
        tooltip: 'client.parcelElement.transfer.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.parcelElementWorkspace.activateWidget(widget, {
            client: controller.client,
            map: controller.map,
            store: controller.parcelElementStore
          });
        },
        args: [this.clientParcelElementTransferWidget, controller],
        conditions: [transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'importData',
        icon: 'input',
        title: 'client.parcelElement.importData',
        tooltip: 'client.parcelElement.importData.tooltip',
        handler: (widget: Widget, controller: ClientController) => {
          controller.parcelElementWorkspace.activateWidget(widget, {
            parcelElement: controller.parcelElement,
            transaction: controller.transaction,
            map: controller.map,
            store: controller.parcelElementStore
          });
        },
        args: [this.clientParcelElementImportWidget, controller],
        conditions: [transactionIsNotInCommitPhase],
        conditionArgs
      }
    ];
  }

}
