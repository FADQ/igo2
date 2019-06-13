import { Inject, Injectable } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { Action, Widget } from '@igo2/common';

import { EditionUndoWidget } from '../../../edition/shared/edition.widgets';

import { ClientController } from '../../shared/controller';
import { ClientParcelElement } from './client-parcel-element.interfaces';
import {
  ClientParcelElementCreateWidget,
  ClientParcelElementUpdateWidget,
  ClientParcelElementUpdateBatchWidget,
  ClientParcelElementFillWidget,
  ClientParcelElementNumberingWidget,
  ClientParcelElementReconciliateWidget,
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
    @Inject(ClientParcelElementUpdateBatchWidget) private clientParcelElementUpdateBatchWidget: Widget,
    @Inject(ClientParcelElementFillWidget) private clientParcelElementFillWidget: Widget,
    @Inject(ClientParcelElementNumberingWidget) private clientParcelElementNumberingWidget: Widget,
    @Inject(ClientParcelElementReconciliateWidget) private clientParcelElementReconciliateWidget: Widget,
    @Inject(ClientParcelElementSliceWidget) private clientParcelElementSliceWidget: Widget,
    @Inject(ClientParcelElementSaveWidget) private clientParcelElementSaveWidget: Widget,
    @Inject(EditionUndoWidget) private editionUndoWidget: Widget,
    @Inject(ClientParcelElementImportWidget) private clientParcelElementImportWidget: Widget,
    @Inject(ClientParcelElementTransferWidget) private clientParcelElementTransferWidget: Widget,
    private languageService: LanguageService
  ) {}

  buildActions(controller: ClientController): Action[] {

    function oneParcelElementIsActive(ctrl: ClientController): boolean {
      return ctrl.activeParcelElement !== undefined;
    }

    function oneOrMoreParcelElementAreSelected(ctrl: ClientController): boolean {
      return ctrl.selectedParcelElements.length > 0;
    }

    function transactionIsNotEmpty(ctrl: ClientController): boolean {
      return ctrl.parcelElementTransaction.empty === false;
    }

    function transactionIsNotInCommitPhase(ctrl: ClientController): boolean {
      return ctrl.parcelElementTransaction.inCommitPhase === false;
    }

    function parcelElementCanBeFilled(ctrl: ClientController): boolean {
      const parcelElement = ctrl.activeParcelElement;
      const geometry = parcelElement === undefined ? undefined : parcelElement.geometry;
      return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length > 1;
    }

    function parcelElementCanBeSliced(ctrl: ClientController): boolean {
      const parcelElement = ctrl.activeParcelElement;
      const geometry = parcelElement === undefined ? undefined : parcelElement.geometry;
      return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length === 1;
    }

    const conditionArgs = [controller];

    return [
      {
        id: 'stopEdition',
        icon: 'cancel',
        title: 'client.parcel.stopEdition',
        tooltip: 'client.parcel.stopEdition.tooltip',
        handler: function(ctrl: ClientController) {
          ctrl.stopParcelEdition();
        },
        args: [controller]
      },
      {
        id: 'create',
        icon: 'plus',
        title: 'edition.create',
        tooltip: 'edition.create.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        args: [this.clientParcelElementCreateWidget, controller],
        conditions: [],
        conditionArgs
      },
      {
        id: 'update',
        icon: 'pencil',
        title: 'edition.update',
        tooltip: 'edition.update.tooltip',
        handler: (singleWidget: Widget, batchWidget: Widget, ctrl: ClientController) => {
          const inputs = {
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          };

          if (ctrl.activeParcelElement !== undefined) {
            ctrl.parcelElementWorkspace.activateWidget(singleWidget, Object.assign({
              parcelElement: ctrl.activeParcelElement
            }, inputs));
          } else {
            ctrl.parcelElementWorkspace.activateWidget(batchWidget, Object.assign({
              parcelElements: ctrl.selectedParcelElements
            }, inputs));
          }
        },
        args: [
          this.clientParcelElementUpdateWidget,
          this.clientParcelElementUpdateBatchWidget,
          controller
        ],
        conditions: [oneOrMoreParcelElementAreSelected, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'edition.delete',
        tooltip: 'edition.delete.tooltip',
        handler: (ctrl: ClientController) => {
          const store = ctrl.parcelElementStore;
          const transaction = ctrl.parcelElementTransaction;
          const parcelElements = ctrl.selectedParcelElements;
          parcelElements.forEach((parcelElement: ClientParcelElement) => {
            transaction.delete(parcelElement, store, {
              title: generateParcelElementOperationTitle(parcelElement, this.languageService)
            });
          });
        },
        args: [controller],
        conditions: [oneOrMoreParcelElementAreSelected, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'fill',
        icon: 'select-all',
        title: 'edition.fill',
        tooltip: 'edition.fill.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            parcelElement: ctrl.activeParcelElement,
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        args: [this.clientParcelElementFillWidget, controller],
        conditions: [oneParcelElementIsActive, transactionIsNotInCommitPhase, parcelElementCanBeFilled],
        conditionArgs
      },
      {
        id: 'slice',
        icon: 'box-cutter',
        title: 'edition.slice',
        tooltip: 'edition.slice.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            parcelElement: ctrl.activeParcelElement,
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        args: [this.clientParcelElementSliceWidget, controller],
        conditions: [oneParcelElementIsActive, transactionIsNotInCommitPhase, parcelElementCanBeSliced],
        conditionArgs
      },
      {
        id: 'save',
        icon: 'floppy',
        title: 'edition.save',
        tooltip: 'edition.save.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            client: ctrl.client,
            transaction: ctrl.parcelElementTransaction,
            store: ctrl.parcelElementStore
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
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            transaction: ctrl.parcelElementTransaction
          });
        },
        args: [this.editionUndoWidget, controller],
        conditions: [transactionIsNotInCommitPhase, transactionIsNotEmpty],
        conditionArgs
      },
      {
        id: 'transfer',
        icon: 'swap-horizontal',
        title: 'client.parcelElement.transfer',
        tooltip: 'client.parcelElement.transfer.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            client: ctrl.client,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        args: [this.clientParcelElementTransferWidget, controller],
        conditions: [transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'importData',
        icon: 'import',
        title: 'client.parcelElement.importData',
        tooltip: 'client.parcelElement.importData.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            parcelElement: ctrl.activeParcelElement,
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        args: [this.clientParcelElementImportWidget, controller],
        conditions: [transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'numbering',
        icon: 'counter',
        title: 'client.parcelElement.numbering',
        tooltip: 'client.parcelElement.numbering.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            transaction: ctrl.parcelElementTransaction,
            store: ctrl.parcelElementStore
          });
        },
        args: [this.clientParcelElementNumberingWidget, controller],
        conditions: [],
        conditionArgs
      },
      {
        id: 'reconciliate',
        icon: 'table-merge-cells',
        title: 'client.parcelElement.reconciliate',
        tooltip: 'client.parcelElement.reconciliate.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            store: ctrl.parcelElementStore
          });
        },
        args: [this.clientParcelElementReconciliateWidget, controller],
        conditions: [],
        conditionArgs
      }
    ];
  }

}
