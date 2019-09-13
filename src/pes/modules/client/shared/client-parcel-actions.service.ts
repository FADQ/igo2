import {  Injectable} from '@angular/core';

import { Action, EntityTableColumn } from '@igo2/common';
import { entitiesToRowData,  exportToCSV } from '@igo2/geo';

import { moveToFeatureStore } from '../../feature/shared/feature.utils';
import { ClientController } from './client-controller';


@Injectable({
  providedIn: 'root'
})
export class ClientParcelActionsService {

  constructor() {}

  buildActions(controller: ClientController): Action[] {
    return [
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
