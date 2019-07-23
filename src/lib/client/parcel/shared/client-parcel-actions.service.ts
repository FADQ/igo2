import { Inject, Injectable} from '@angular/core';

import { ClientParcelElementEditionState } from '../../parcel-element/shared/client-parcel-element.enums';
import { ClientParcelElementEditWidget } from '../../parcel-element/shared/client-parcel-element.widgets';

import { Action, EntityTableColumn, Widget } from '@igo2/common';
import { entitiesToRowData,  exportToCSV } from '@igo2/geo';

import { ClientController } from '../../shared/controller';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelActionsService {

  constructor(
    @Inject(ClientParcelElementEditWidget) private clientParcelElementEditWidget: Widget
  ) {}

  buildActions(controller: ClientController): Action[] {
    return [
      {
        id: 'activateEdition',
        icon: 'square-edit-outline',
        title: 'client.parcelElement.activateEdition',
        tooltip: 'client.parcelElement.activateEdition.tooltip',
        handler: function(widget: Widget, ctrl: ClientController) {
          ctrl.getParcelEditionState()
            .subscribe((state: ClientParcelElementEditionState) => {
              ctrl.parcelWorkspace.activateWidget(widget, {
                controller: ctrl,
                state: state
              });
              if (state === ClientParcelElementEditionState.OK) {
                ctrl.activateParcelEdition();
              } else {
                ctrl.parcelWorkspace.activateWidget(widget, {
                  controller: ctrl,
                  state: state
                });
              }
            });
        },
        args: [this.clientParcelElementEditWidget, controller]
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
