import { Inject, Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import turfUnion from '@turf/union';

import { getEntityId, getEntityRevision } from '@igo2/common';
import { LanguageService } from '@igo2/core';
import {
  Action,
  EntityStore,
  EntityStoreFilterSelectionStrategy,
  Widget
} from '@igo2/common';
import { uuid } from '@igo2/utils';

import { EditionUndoWidget } from 'src/lib/edition';

import {
  Client,
  ClientParcelElement,
  ClientParcelElementMessage,
  ClientParcelElementCreateWidget,
  ClientParcelElementUpdateWidget,
  ClientParcelElementUpdateBatchWidget,
  ClientParcelElementRedrawWidget,
  ClientParcelElementFillWidget,
  ClientParcelElementNumberingWidget,
  ClientParcelElementSimplifyWidget,
  ClientParcelElementSliceWidget,
  ClientParcelElementSaveWidget,
  ClientParcelElementTranslateWidget,
  ClientParcelElementImportWidget,
  ClientParcelElementTransferWidget,
  ClientParcelElementWithoutOwnerWidget,
  ClientParcelElementService,
  ClientParcelTxReconciliateWidget,
  generateParcelElementOperationTitle,
  getParcelElementErrors,
  getParcelElementMergeBase
} from 'src/lib/client';
import { moveToFeatureStore } from 'src/lib/feature';
import { every } from 'src/lib/utils';

import { ClientController } from './client-controller';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelElementActionsService {

  constructor(
    @Inject(ClientParcelElementCreateWidget) private clientParcelElementCreateWidget: Widget,
    @Inject(ClientParcelElementUpdateWidget) private clientParcelElementUpdateWidget: Widget,
    @Inject(ClientParcelElementUpdateBatchWidget) private clientParcelElementUpdateBatchWidget: Widget,
    @Inject(ClientParcelElementRedrawWidget) private clientParcelElementRedrawWidget: Widget,
    @Inject(ClientParcelElementFillWidget) private clientParcelElementFillWidget: Widget,
    @Inject(ClientParcelElementNumberingWidget) private clientParcelElementNumberingWidget: Widget,
    @Inject(ClientParcelElementSimplifyWidget) private clientParcelElementSimplifyWidget: Widget,
    @Inject(ClientParcelElementSliceWidget) private clientParcelElementSliceWidget: Widget,
    @Inject(ClientParcelElementSaveWidget) private clientParcelElementSaveWidget: Widget,
    @Inject(ClientParcelElementTranslateWidget) private clientParcelElementTranslateWidget: Widget,
    @Inject(EditionUndoWidget) private editionUndoWidget: Widget,
    @Inject(ClientParcelElementImportWidget) private clientParcelElementImportWidget: Widget,
    @Inject(ClientParcelElementTransferWidget) private clientParcelElementTransferWidget: Widget,
    @Inject(ClientParcelElementWithoutOwnerWidget) private clientParcelElementWithoutOwnerWidget: Widget,
    @Inject(ClientParcelTxReconciliateWidget) private clientParcelTxReconciliateWidget: Widget,
    private clientParcelElementService: ClientParcelElementService,
    private languageService: LanguageService
  ) {}

  /**
   * Load a controller's parcel element workspace actions
   * @param controller Client controller
   */
  loadActions(controller: ClientController) {
    const actions = this.buildActions(controller);
    controller.parcelElementWorkspace.actionStore.load(actions);
  }

  /**
   * Create actions
   * @param controller Client controller
   * @returns Actions
   */
  private buildActions(controller: ClientController): Action[] {
    return [
      {
        id: 'deactivate-parcel-elements',
        icon: 'close-box-outline',
        title: 'client.parcelTx.stop',
        tooltip: 'client.parcelTx.stop.tooltip',
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
        }
      },
      {
        id: 'filterSelection',
        icon: 'selection',
        title: 'map.filterSelection.title',
        tooltip: 'map.filterSelection.tooltip',
        args: [controller],
        handler: function(ctrl: ClientController) {
          const filterStrategy = ctrl.parcelElementStore
            .getStrategyOfType(EntityStoreFilterSelectionStrategy);
          if (filterStrategy.active) {
            filterStrategy.deactivate();
          } else {
            filterStrategy.activate();
          }
        },
        ngClass: function(ctrl: ClientController) {
          const filterStrategy = ctrl.parcelElementStore
            .getStrategyOfType(EntityStoreFilterSelectionStrategy);
          return filterStrategy.active$.pipe(
            map((active: boolean) => ({
              'fadq-actionbar-item-divider': true,
              'active-accent': active
            }))
          );
        }
      },
      {
        id: 'createUpdate',
        icon: 'pencil',
        title: 'edition.createUpdate',
        tooltip: 'edition.createUpdate.tooltip',
        args: [
          controller,
          this.clientParcelElementCreateWidget,
          this.clientParcelElementUpdateWidget,
          this.clientParcelElementUpdateBatchWidget
        ],
        handler: (
          ctrl: ClientController,
          createWidget: Widget,
          singleWidget: Widget,
          batchWidget: Widget
        ) => {
          const inputs = {
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          };

          if (ctrl.selectedParcelElements.length === 0) {
            ctrl.parcelElementWorkspace.activateWidget(createWidget, inputs);
          } else if (ctrl.activeParcelElement !== undefined) {
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
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'redraw',
        icon: 'pencil-remove',
        title: 'edition.redraw',
        tooltip: 'edition.redraw.tooltip',
        args: [
          controller,
          this.clientParcelElementRedrawWidget
        ],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            transaction: ctrl.parcelElementTransaction,
            map: ctrl.map,
            store: ctrl.parcelElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          zeroOrOneParcelElementIsSelected(ctrl),
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'translate',
        icon: 'pan',
        title: 'edition.translate',
        tooltip: 'edition.translate.tooltip',
        args: [controller, this.clientParcelElementTranslateWidget],
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
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'union',
        icon: 'vector-union',
        title: 'edition.union',
        tooltip: 'edition.union.tooltip',
        args: [controller],
        handler: (ctrl: ClientController) => {
          const store = ctrl.parcelElementStore;
          const transaction = ctrl.parcelElementTransaction;
          const parcelElements = ctrl.selectedParcelElements;

          const baseParcelElement = getParcelElementMergeBase(parcelElements);
          const properties = baseParcelElement.properties;
          let meta;
          if (baseParcelElement.properties.idParcelle) {
            meta = Object.assign({}, baseParcelElement.meta, {
              revision: getEntityRevision(baseParcelElement) + 1
            });
          } else {
            meta = {
              id: uuid()
            };
          }
          const union = Object.assign(turfUnion(...parcelElements), {
            meta,
            projection: 'EPSG:4326',
            properties
          });

          if (union.geometry.type === 'MultiPolygon') {
            return;
          }

          const unionId = getEntityId(union);
          this.clientParcelElementService
            .createParcelElement(union)
            .subscribe((unionParcelElement: ClientParcelElement) => {
              parcelElements.forEach((parcelElement: ClientParcelElement) => {
                if (getEntityId(parcelElement) !== unionId) {
                  transaction.delete(parcelElement, store, {
                    title: generateParcelElementOperationTitle(
                      parcelElement,
                      this.languageService
                    )
                  });
                }
              });
              const title = generateParcelElementOperationTitle(
                unionParcelElement,
                this.languageService
              );
              if (baseParcelElement.properties.idParcelle) {
                transaction.update(baseParcelElement, unionParcelElement, store, {
                  title
                });
              } else {
                transaction.insert(unionParcelElement, store, {
                  title
                });
              }
            });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          twoParcelElementAreSelected(ctrl),
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'simplify',
        icon: 'vector-polygon',
        title: 'edition.simplify',
        tooltip: 'edition.simplify.tooltip',
        args: [controller, this.clientParcelElementSimplifyWidget],
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
        id: 'delete',
        icon: 'account-arrow-right',
        title: 'client.parcelElement.delete',
        tooltip: 'client.parcelElement.delete',
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
          transactionIsNotInCommitPhase(ctrl),
          noOtherExplParcelElementAreSelected(ctrl)
        )
      },
      {
        id: 'recoverParcelsWithoutOwner',
        icon: 'account-arrow-left',
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
            annee: ctrl.parcelYear.annee,
            clientStore: clientStore,
            parcelElementStore: ctrl.parcelElementStore
          }, {
            complete: (toClient: Client) => {
              const controllers = controller.controllers;
              const toController = controllers.get(toClient.info.numero);
              toController.reloadParcelElements();
            }
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
            annee: ctrl.parcelYear.annee,
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
        title: 'client.parcelTx.reconciliate',
        tooltip: 'client.parcelTx.reconciliate.tooltip',
        args: [controller, this.clientParcelTxReconciliateWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.parcelElementWorkspace.activateWidget(widget, {
            client: ctrl.client,
            annee: ctrl.parcelYear.annee
          }, {
            complete: () => {
              ctrl.deactivateParcelElements();
            }
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

function noOtherExplParcelElementAreSelected(ctrl: ClientController): Observable<boolean> {
  return ctrl.selectedParcelElements$.pipe(
    map((parcelElements: ClientParcelElement[]) => parcelAsNoOtherExplo(parcelElements) === true)
  );
}

function parcelAsNoOtherExplo (parcelElements: ClientParcelElement[]) {
  let noParcelsOtherExploited: boolean = true;
  parcelElements.forEach((parcelElement: ClientParcelElement) => {
    if (parcelElement.properties.exploitantTran !== undefined &&
        parcelElement.properties.exploitantTran !== null) { noParcelsOtherExploited = false; }
  });
  return noParcelsOtherExploited;
}

function twoParcelElementAreSelected(ctrl: ClientController): Observable<boolean> {
  return ctrl.selectedParcelElements$.pipe(
    map((parcelElements: ClientParcelElement[]) => parcelElements.length === 2)
  );
}

function zeroOrOneParcelElementIsSelected(ctrl: ClientController): Observable<boolean> {
  return ctrl.selectedParcelElements$.pipe(
    map((parcelElements: ClientParcelElement[]) => parcelElements.length <= 1)
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
