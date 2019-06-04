import { Injectable} from '@angular/core';

import { Action, EntityTableColumn } from '@igo2/common';
import { entitiesToRowData,  exportToCSV } from '@igo2/geo';

import { ClientController } from '../../shared/controller';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelActionsService {

  buildActions(controller: ClientController): Action[] {
    return [
      {
        id: 'startEdition',
        // icon: 'power_settings_new',
        icon: 'add_box',
        title: 'client.parcel.startEdition',
        tooltip: 'client.parcel.startEdition.tooltip',
        handler: function(controller: ClientController) {
          controller.startParcelEdition();
        },
        args: [controller]
      },
      {
        id: 'export',
        icon: 'file_download',
        title: 'client.parcel.exportToCSV',
        tooltip: 'client.parcel.exportToCSV.tooltip',
        handler: function(controller: ClientController) {
          const workspace = controller.parcelWorkspace;
          const columns = workspace.meta.tableTemplate.columns;
          const headers = columns.map((column: EntityTableColumn) => column.title);
          const rows = entitiesToRowData(workspace.entityStore.view.all(), columns);

          const fileName = `Parcelles du client ${controller.client.info.numero}.csv`;
          exportToCSV([headers].concat(rows), fileName, ';');
        },
        args: [controller]
      }
    ];
  }
}
