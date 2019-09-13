import { Inject, Injectable } from '@angular/core';

import { Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import { Action, EntityStore, Widget } from '@igo2/common';

import { EditionUndoWidget } from 'src/lib/edition';

import {
  Client,
  ClientController,
  ClientParcelElement,
  ClientParcelElementMessage,
  ClientParcelElementCreateWidget,
  ClientParcelElementUpdateWidget,
  ClientParcelElementUpdateBatchWidget,
  ClientParcelElementFillWidget,
  ClientParcelElementNumberingWidget,
  ClientParcelElementReconciliateWidget,
  ClientParcelElementSliceWidget,
  ClientParcelElementSaveWidget,
  ClientParcelElementImportWidget,
  ClientParcelElementTransferWidget,
  ClientParcelElementWithoutOwnerWidget,
  generateParcelElementOperationTitle,
  getParcelElementErrors
} from 'src/lib/client';

import { moveToFeatureStore } from '../../feature/shared/feature.utils';

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
    @Inject(ClientParcelElementWithoutOwnerWidget) private clientParcelElementWithoutOwnerWidget: Widget,
    private languageService: LanguageService
  ) {}

  buildActions(controller: ClientController): Action[] {

    function every(...observables: Observable<boolean>[]): Observable<boolean> {
      return combineLatest(observables).pipe(
        map((bunch: boolean[]) => bunch.every(Boolean))
      );
    }

    function noActiveWidget(ctrl: ClientController): Observable<boolean> {
      return ctrl.parcelElementWorkspace.widget$.pipe(
        map((widget: Widget) => widget === undefined)
      );
    }

    function oneParcelElementIsActive(ctrl: ClientController): Observable<boolean> {
      return ctrl.selectedParcelElements$.pipe(
        map((parcelElements: ClientParcelElement[]) => parcelElements.length === 1)
      );
    }

    function oneOrMoreParcelElementAreSelected(ctrl: ClientController): Observable<boolean> {
      return ctrl.selectedParcelElements$.pipe(
        map((parcelElements: ClientParcelElement[]) => parcelElements.length > 0)
      );
    }

    function transactionIsEmpty(ctrl: ClientController): Observable<boolean> {
      return ctrl.parcelElementTransaction.empty$;
    }

    function transactionIsNotEmpty(ctrl: ClientController): Observable<boolean> {
      return ctrl.parcelElementTransaction.empty$.pipe(
        map((empty: boolean) => !empty)
      );
    }

    function transactionIsNotInCommitPhase(ctrl: ClientController): Observable<boolean> {
      return ctrl.parcelElementTransaction.inCommitPhase$.pipe(
        map((inCommitPhase: boolean) => !inCommitPhase)
      );
    }

    function parcelElementCanBeFilled(ctrl: ClientController): Observable<boolean> {
      return ctrl.selectedParcelElements$.pipe(
        map(() => {
          const parcelElement = ctrl.activeParcelElement;
          const geometry = parcelElement === undefined ? undefined : parcelElement.geometry;
          return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length > 1;
        })
      );
    }

    function parcelElementCanBeSliced(ctrl: ClientController): Observable<boolean> {
      return ctrl.selectedParcelElements$.pipe(
        map(() => {
          const parcelElement = ctrl.activeParcelElement;
          const geometry = parcelElement === undefined ? undefined : parcelElement.geometry;
          return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length === 1;
        })
      );
    }

    function noParcelElementError(ctrl: ClientController): Observable<boolean> {
      return ctrl.parcelElementStore.entities$.pipe(
        map((parcelElements: ClientParcelElement[]) => {
          const errors = parcelElements
            .reduce((acc: ClientParcelElementMessage[], parcelElement: ClientParcelElement) => {
              acc.push(...getParcelElementErrors(parcelElement));
              return acc;
            }, []);
          return errors.length === 0;
        })
      );
    }

    function moreThanOneClient(ctrl: ClientController): Observable<boolean> {
      return ctrl.controllers.count$.pipe(
        map((count: number) => count > 1)
      );
    }

    return [
      {
        id: 'deactivate-parcel-elements',
        icon: 'close-box-outline',
        title: 'client.parcelElement.stopTx',
        tooltip: 'client.parcelElement.stopTx.tooltip',
        args: [controller],
        handler: function(ctrl: ClientController) {
          ctrl.deactivateParcelElements();
        },
        availability: noActiveWidget,
        ngClass: (ctrl: ClientController) => of({
          'fadq-actionbar-item-divider': true
        })
      },
      {
        id: 'zoom-to-features',
        icon: 'feature-search-outline',
        title: 'map.moveToFeatures.title',
        tooltip: 'map.moveToFeatures.tooltip',
        args: [controller],
        handler: function(ctrl: ClientController) {
          moveToFeatureStore(
            ctrl.parcelElementWorkspace.map,
            ctrl.parcelElementWorkspace.parcelElementStore
          );
        },
        ngClass: (ctrl: ClientController) => of({
          'fadq-actionbar-item-divider': true
        })
      },
      {
        id: 'create',
        icon: 'plus',
        title: 'edition.create',
        tooltip: 'edition.create.tooltip',
        args: [controller, this.clientParcelElementCreateWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        availability: noActiveWidget
      },
      {
        id: 'update',
        icon: 'pencil',
        title: 'edition.update',
        tooltip: 'edition.update.tooltip',
        args: [
          controller,
          this.clientParcelElementUpdateWidget,
          this.clientParcelElementUpdateBatchWidget
        ],
        handler: (ctrl: ClientController, singleWidget: Widget, batchWidget: Widget) => {
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
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          oneOrMoreParcelElementAreSelected(ctrl),
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'edition.delete',
        tooltip: 'edition.delete.tooltip',
        args: [controller],
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
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          oneOrMoreParcelElementAreSelected(ctrl),
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'fill',
        icon: 'select-all',
        title: 'edition.fill',
        tooltip: 'edition.fill.tooltip',
        args: [controller, this.clientParcelElementFillWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            parcelElement: ctrl.activeParcelElement,
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          oneParcelElementIsActive(ctrl),
          transactionIsNotInCommitPhase(ctrl),
          parcelElementCanBeFilled(ctrl)
        )
      },
      {
        id: 'slice',
        icon: 'box-cutter',
        title: 'edition.slice',
        tooltip: 'edition.slice.tooltip',
        args: [controller, this.clientParcelElementSliceWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            parcelElement: ctrl.activeParcelElement,
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          oneParcelElementIsActive(ctrl),
          transactionIsNotInCommitPhase(ctrl),
          parcelElementCanBeSliced(ctrl)
        )
      },
      {
        id: 'numbering',
        icon: 'counter',
        title: 'client.parcelElement.numbering',
        tooltip: 'client.parcelElement.numbering.tooltip',
        args: [controller, this.clientParcelElementNumberingWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            transaction: ctrl.parcelElementTransaction,
            store: ctrl.parcelElementStore
          });
        },
        availability: noActiveWidget,
        ngClass: (ctrl: ClientController) => of({
          'fadq-actionbar-item-divider': true
        })
      },
      {
        id: 'import',
        icon: 'import',
        title: 'client.parcelElement.import',
        tooltip: 'client.parcelElement.import.tooltip',
        args: [controller, this.clientParcelElementImportWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            parcelElement: ctrl.activeParcelElement,
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'recoverParcelsWithoutOwner',
        icon: 'map-search-outline',
        title: 'client.parcelElement.recoverParcelsWithoutOwner',
        tooltip: 'client.parcelElement.recoverParcelsWithoutOwner.tooltip',
        args: [controller, this.clientParcelElementWithoutOwnerWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'transfer',
        icon: 'account-switch',
        title: 'client.parcelElement.transfer',
        tooltip: 'client.parcelElement.transfer.tooltip',
        args: [controller, this.clientParcelElementTransferWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          const clients = ctrl.controllers.all()
            .filter((_ctrl: ClientController) => _ctrl !== ctrl)
            .map((_ctrl: ClientController) => _ctrl.client);
          const clientStore = new EntityStore(clients, {
            getKey: (client: Client) => client.info.numero
          });

          ctrl.parcelElementWorkspace.activateWidget(widget, {
            client: ctrl.client,
            annee: ctrl.parcelYear,
            clientStore: clientStore,
            parcelElementStore: ctrl.parcelElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          transactionIsEmpty(ctrl),
          moreThanOneClient(ctrl)
        ),
        ngClass: (ctrl: ClientController) => of({
          'fadq-actionbar-item-divider': true
        })
      },
      {
        id: 'save',
        icon: 'floppy',
        title: 'edition.save',
        tooltip: 'edition.save.tooltip',
        args: [controller, this.clientParcelElementSaveWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            client: ctrl.client,
            annee: ctrl.parcelYear,
            transaction: ctrl.parcelElementTransaction,
            store: ctrl.parcelElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          transactionIsNotInCommitPhase(ctrl),
          transactionIsNotEmpty(ctrl)
        )
      },
      {
        id: 'undo',
        icon: 'undo',
        title: 'edition.undo',
        tooltip: 'edition.undo.tooltip',
        args: [controller, this.editionUndoWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            transaction: ctrl.parcelElementTransaction
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          transactionIsNotInCommitPhase(ctrl),
          transactionIsNotEmpty(ctrl)
        )
      },
      {
        id: 'reconciliate',
        icon: 'table-merge-cells',
        title: 'client.parcelElement.reconciliate',
        tooltip: 'client.parcelElement.reconciliate.tooltip',
        args: [controller, this.clientParcelElementReconciliateWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            client: ctrl.client,
            annee: ctrl.parcelYear
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          transactionIsEmpty(ctrl),
          noParcelElementError(ctrl)
        )
      }
    ];
  }

}