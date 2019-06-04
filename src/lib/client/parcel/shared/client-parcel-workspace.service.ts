import { Injectable} from '@angular/core';

import { ActionStore, Workspace } from '@igo2/common';
import {
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  FeatureDataSource,
  IgoMap,
  VectorLayer
} from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { createClientDefaultSelectionStyle } from '../../shared/client.utils';
import { ClientParcel } from './client-parcel.interfaces';
import { ClientParcelTableService } from './client-parcel-table.service';
import { createParcelLayer } from './client-parcel.utils';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelWorkspaceService {

  static viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];

  private sharedLoadingStrategy: FeatureStoreLoadingStrategy;

  private sharedSelectionStrategy: FeatureStoreSelectionStrategy;

  constructor(private clientParcelTableService: ClientParcelTableService) {}

  createParcelWorkspace(client: Client,  map: IgoMap): Workspace<ClientParcel> {
    if (this.sharedLoadingStrategy === undefined) {
      this.sharedLoadingStrategy = this.createSharedLoadingStrategy();
    }

    if (this.sharedSelectionStrategy === undefined) {
      this.sharedSelectionStrategy = this.createSharedSelectionStrategy(map);
    }

    return new Workspace<ClientParcel>({
      id: `fadq.${client.info.numero}-1-parcel-workspace`,
      title: `${client.info.numero} - Parcelles`,
      entityStore: this.createParcelStore(client, map),
      actionStore: this.createParcelActionStore(),
      meta: {
        client,
        type: 'parcel',
        tableTemplate: this.clientParcelTableService.buildTable()
      }
    });
  }

  private createParcelStore(client: Client, map: IgoMap): FeatureStore<ClientParcel> {
    const store = new FeatureStore<ClientParcel>([], {
      getKey: (entity: ClientParcel) => entity.properties.id,
      map
    });
    store.view.sort({
      valueAccessor: (parcel: ClientParcel) => parcel.properties.noParcelleAgricole,
      direction: 'asc'
    });

    const layer = createParcelLayer(client);
    store.bindLayer(layer);

    store.addStrategy(this.sharedLoadingStrategy, true);
    store.addStrategy(this.sharedSelectionStrategy, true);

    return store;
  }

  private createParcelActionStore(): ActionStore {
    return new ActionStore([]);
  }

  private createSharedLoadingStrategy(): FeatureStoreLoadingStrategy {
    return new FeatureStoreLoadingStrategy({
      viewScale: ClientParcelWorkspaceService.viewScale
    });
  }

  private createSharedSelectionStrategy(map: IgoMap): FeatureStoreSelectionStrategy {
    return new FeatureStoreSelectionStrategy({
      map: map,
      layer: new VectorLayer({
        title: `Parcelles sélectionnées`,
        zIndex: 102,
        source: new FeatureDataSource(),
        style: createClientDefaultSelectionStyle(),
        showInLayerList: false,
        removable: false,
        browsable: false
      }),
      many: true,
      viewScale: ClientParcelWorkspaceService.viewScale,
      areaRatio: 0.004,
      dragBox: true
    });
  }
}
