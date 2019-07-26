import { Inject, Injectable} from '@angular/core';

import { ClientParcelElementTxState } from '../../parcel-element/shared/client-parcel-element.enums';
import { ClientParcelElementStartTxWidget } from '../../parcel-element/shared/client-parcel-element.widgets';

import { Action, EntityTableColumn, Widget } from '@igo2/common';
import { entitiesToRowData,  exportToCSV } from '@igo2/geo';

import { ClientController } from '../../shared/controller';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelActionsService {

  constructor(
    @Inject(ClientParcelElementStartTxWidget) private clientParcelElementStartTxWidget: Widget
  ) {}

  buildActions(controller: ClientController): Action[] {

    function onlyOneParcelTx(ctrl: ClientController): boolean {
      return ctrl.controllerStore.view.all()
        .find((_ctrl: ClientController) => _ctrl.parcelElementTxActive) === undefined;
    }

    const conditionArgs = [controller];

    return [
      {
        id: 'startTx',
        icon: 'square-edit-outline',
        title: 'client.parcelElement.startTx',
        tooltip: 'client.parcelElement.startTx.tooltip',
        handler: function(widget: Widget, ctrl: ClientController) {
          ctrl.getParcelTxState()
            .subscribe((state: ClientParcelElementTxState) => {
              if (state === ClientParcelElementTxState.OK) {
                ctrl.activateParcelTx();
              } else {
                ctrl.parcelWorkspace.activateWidget(widget, {
                  controller: ctrl,
                  state: state
                });
              }
            });
        },
        args: [this.clientParcelElementStartTxWidget, controller],
        conditions: [onlyOneParcelTx],
        conditionArgs
      },
      {
        id: 'export',
        icon: 'file-download',
        title: 'client.parcel.exportToCSV',
        tooltip: 'client.parcel.exportToCSV.tooltip',
        handler: function(ctrl: ClientController) {
          const workspace = ctrl.parcelWorkspace;
          const columns = workspace.meta.tableTemplate.columns;
          const headers = columns.map((column: EntityTableColumn) => column.title);
          const rows = entitiesToRowData(workspace.entityStore.view.all(), columns);

          const fileName = `Parcelles du client ${ctrl.client.info.numero}.csv`;
          exportToCSV([headers].concat(rows), fileName, ';');
        },
        args: [controller]
      }
    ];
  }
}
