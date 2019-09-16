import { Inject, Injectable} from '@angular/core';

import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Action, EntityTableColumn, Widget } from '@igo2/common';
import { entitiesToRowData,  exportToCSV } from '@igo2/geo';
import { DetailedContext } from '@igo2/context';
import { ContextState } from '@igo2/integration';

import {
  ClientController,
  ClientParcelElementTxService,
  ClientParcelElementTxState,
  ClientParcelElementStartTxWidget
} from 'src/lib/client';

import { moveToFeatureStore } from 'src/apps/shared/modules/feature/shared/feature.utils';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelActionsService {

  constructor(
    @Inject(ClientParcelElementStartTxWidget) private clientParcelElementStartTxWidget: Widget,
    private clientParcelElementTxService: ClientParcelElementTxService,
    private contextState: ContextState
  ) {}

  buildActions(controller: ClientController): Action[] {

    function every(...observables: Observable<boolean>[]): Observable<boolean> {
      return combineLatest(observables).pipe(
        map((bunch: boolean[]) => bunch.every(Boolean))
      );
    }

    function onlyOneParcelTx(ctrl: ClientController): Observable<boolean> {
      return ctrl.controllers.view.all$().pipe(
        map((controllers: ClientController[]) => {
          return controllers.find((_ctrl: ClientController) => _ctrl.parcelElementTxActive) === undefined;
        })
      );
    }

    return [
      {
        id: 'activate-parcel-eLements',
        icon: 'square-edit-outline',
        title: 'client.parcelElement.startTx',
        tooltip: 'client.parcelElement.startTx.tooltip',
        args: [controller, this.clientParcelElementStartTxWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          this.clientParcelElementTxService.getParcelTxState(ctrl.client, ctrl.parcelYear)
            .subscribe((state: ClientParcelElementTxState) => {
              if (state === ClientParcelElementTxState.OK) {
                ctrl.activateParcelElements();
              } else {
                ctrl.parcelWorkspace.activateWidget(widget, {
                  controller: ctrl,
                  state: state
                });
              }
            });
        },
        availability: (ctrl: ClientController) => {
          const contextMesurage$ = this.contextState.context$.pipe(
            map((context: DetailedContext) => context.uri === 'mesurage')
          );
          return every(
            contextMesurage$,
            onlyOneParcelTx(ctrl)
          );
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
