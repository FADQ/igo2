import { Injectable} from '@angular/core';

import { Action, EntityTableColumn } from '@igo2/common';
import { entitiesToRowData,  exportToCSV } from '@igo2/geo';

import { ClientWorkspace } from './client-workspace';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelActionsService {

  loadParcelActions(workspace: ClientWorkspace) {
    const actions = this.buildParcelActions(workspace);
    workspace.parcelEditor.actionStore.load(actions);
  }

  private buildParcelActions(workspace: ClientWorkspace): Action[] {
    return [
      {
        id: 'export',
        icon: 'file_download',
        title: 'client.parcel.exportToCSV',
        tooltip: 'client.parcel.exportToCSV.tooltip',
        handler: function(ws: ClientWorkspace) {
          const editor = ws.parcelEditor;
          const columns = editor.tableTemplate.columns;
          const headers = columns.map((column: EntityTableColumn) => column.title);
          const rows = entitiesToRowData(editor.entityStore.view.all(), columns);

          const fileName = `Parcelles du client ${ws.client.info.numero}.csv`;
          exportToCSV([headers].concat(rows), fileName, ';');
        },
        args: [workspace]
      }
    ]  
  }
}
