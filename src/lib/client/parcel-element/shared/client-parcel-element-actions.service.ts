import { Inject, Injectable } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { Action, Widget, EntityStore } from '@igo2/common';

import { EditionUndoWidget } from '../../../edition/shared/edition.widgets';

import { Client } from '../../shared/client.interfaces';
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

    function noActiveWidget(ctrl: ClientController): boolean {
      return !ctrl.parcelElementWorkspace.hasWidget;
    }

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

    function moreThanOneClient(ctrl: ClientController): boolean {
      return ctrl.controllerStore.count > 1;
    }

    const conditionArgs = [controller];

    return [
      {
        id: 'deactivateEdition',
        icon: 'close-box-outline',
        title: 'client.parcelElement.deactivateEdition',
        tooltip: 'client.parcelElement.deactivateEdition.tooltip',
        handler: function(ctrl: ClientController) {
          ctrl.deactivateParcelEdition();
        },
        args: [controller],
        conditions: [noActiveWidget],
        conditionArgs
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
        conditions: [noActiveWidget],
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
        conditions: [noActiveWidget, oneOrMoreParcelElementAreSelected, transactionIsNotInCommitPhase],
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
        conditions: [noActiveWidget, oneOrMoreParcelElementAreSelected, transactionIsNotInCommitPhase],
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
        conditions: [noActiveWidget, oneParcelElementIsActive, transactionIsNotInCommitPhase, parcelElementCanBeFilled],
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
        conditions: [noActiveWidget, oneParcelElementIsActive, transactionIsNotInCommitPhase, parcelElementCanBeSliced],
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
            annee: ctrl.parcelYear,
            transaction: ctrl.parcelElementTransaction,
            store: ctrl.parcelElementStore
          });
        },
        args: [this.clientParcelElementSaveWidget, controller],
        conditions: [noActiveWidget, transactionIsNotInCommitPhase, transactionIsNotEmpty],
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
        conditions: [noActiveWidget, transactionIsNotInCommitPhase, transactionIsNotEmpty],
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
        conditions: [noActiveWidget, transactionIsNotInCommitPhase],
        conditionArgs
      },
      {
        id: 'transfer',
        icon: 'account-switch',
        title: 'client.parcelElement.transfer',
        tooltip: 'client.parcelElement.transfer.tooltip',
        handler: (widget: Widget, ctrl: ClientController) => {
          const clients = ctrl.controllerStore.all()
            .filter((_ctrl: ClientController) => _ctrl !== ctrl)
            .map((_ctrl: ClientController) => _ctrl.client);
          const clientStore = new EntityStore(clients, {
            getKey: (client: Client) => client.info.numero
          });

          ctrl.parcelElementWorkspace.activateWidget(widget, {
            client: ctrl.client,
            clientStore: clientStore,
            parcelElementSore: ctrl.parcelElementStore
          });
        },
        args: [this.clientParcelElementTransferWidget, controller],
        conditions: [noActiveWidget, transactionIsNotInCommitPhase],
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
        conditions: [noActiveWidget],
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
        conditions: [noActiveWidget],
        conditionArgs
      }
    ];
  }

}
