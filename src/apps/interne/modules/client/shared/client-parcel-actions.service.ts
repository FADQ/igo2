import { Inject, Injectable} from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Action,
  EntityStoreFilterSelectionStrategy,
  EntityTableColumn,
  Widget
} from '@igo2/common';
import { entitiesToRowData, exportToCSV } from '@igo2/geo';
import { ContextState } from '@igo2/integration';

import {
  ClientParcelTxService,
  ClientParcelTxState,
  FeatureStoreFilterNotOwnedStrategy,
  parcelElementsEnabledInContext
} from 'src/lib/client';
import { moveToFeatureStore } from 'src/lib/feature';

import { ClientParcelTxStartWidget } from './client-parcel-tx.widgets';
import { ClientController } from './client-controller';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelActionsService {

  constructor(
    @Inject(ClientParcelTxStartWidget) private clientParcelTxStartTxWidget: Widget,
    private clientParcelTxService: ClientParcelTxService,
    private contextState: ContextState
  ) {}

  /**
   * Load a controller's parcel workspace actions
   * @param controller Client controller
   */
  loadActions(controller: ClientController) {
    const actions = this.buildActions(controller);
    controller.parcelWorkspace.actionStore.load(actions);
  }

  /**
   * Create actions
   * @param controller Client controller
   * @returns Actions
   */
  private buildActions(controller: ClientController): Action[] {
    return [
      {
        id: 'activate-parcel-eLements',
        icon: 'square-edit-outline',
        title: 'client.parcelTx.start',
        tooltip: 'client.parcelTx.start.tooltip',
        args: [controller, this.clientParcelTxStartTxWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          this.clientParcelTxService.getParcelTxState(ctrl.client, ctrl.parcelYear.annee)
            .subscribe((state: ClientParcelTxState) => {
              if (state === ClientParcelTxState.OK) {
                ctrl.activateParcelElements();
              } else {
                ctrl.parcelWorkspace.activateWidget(widget, {
                  controller: ctrl,
                  state: state
                });
              }
            });
        },
        display: (ctrl: ClientController) => {
          const contextMesurage$ = this.contextState.context$.pipe(
            map(parcelElementsEnabledInContext)
          );
          return contextMesurage$ as Observable<boolean>;
        }
      },
      {
        id: 'zoom-to-features',
        icon: 'feature-search-outline',
        title: 'map.moveToFeatures.title',
        tooltip: 'map.moveToFeatures.tooltip',
        args: [controller],
        handler: function(ctrl: ClientController) {
          moveToFeatureStore(
            ctrl.parcelWorkspace.map,
            ctrl.parcelWorkspace.parcelStore
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
          const filterStrategy = ctrl.parcelStore
            .getStrategyOfType(EntityStoreFilterSelectionStrategy);
          if (filterStrategy.active) {
            filterStrategy.deactivate();
          } else {
            filterStrategy.activate();
          }
        },
        ngClass: function(ctrl: ClientController) {
          const filterStrategy = ctrl.parcelStore
            .getStrategyOfType(EntityStoreFilterSelectionStrategy);
          return filterStrategy.active$.pipe(
            map((active: boolean) => ({
              'active-accent': active
            }))
          );
        }
      },
      {
        id: 'filterNotOwned',
        icon: 'account-check',
        title: 'client.parcel.filterNotOwned.title',
        tooltip: 'client.parcel.filterNotOwned.tooltip',
        args: [controller],
        handler: function(ctrl: ClientController) {
          const filterStrategy = ctrl.parcelStore
            .getStrategyOfType(FeatureStoreFilterNotOwnedStrategy);
          if (filterStrategy.active) {
            filterStrategy.deactivate();
          } else {
            filterStrategy.activate();
          }
        },
        ngClass: function(ctrl: ClientController) {
          const filterStrategy = ctrl.parcelStore
            .getStrategyOfType(FeatureStoreFilterNotOwnedStrategy);
          return filterStrategy.active$.pipe(
            map((active: boolean) => ({
              'fadq-actionbar-item-divider': true,
              'active-accent': active
            }))
          );
        }
      },
      {
        id: 'export',
        icon: 'file-download',
        title: 'client.parcel.exportToCSV',
        tooltip: 'client.parcel.exportToCSV.tooltip',
        args: [controller],
        handler: function(ctrl: ClientController) {
          const workspace = ctrl.parcelWorkspace;
          const columns = workspace.meta.tableTemplate.columns;
          const headers = columns.map((column: EntityTableColumn) => column.title);
          const rows = entitiesToRowData(workspace.entityStore.view.all(), columns);

          const fileName = `Parcelles du client ${ctrl.client.info.numero}.csv`;
          exportToCSV([headers].concat(rows), fileName, ';');
        }
      }
    ];
  }
}
