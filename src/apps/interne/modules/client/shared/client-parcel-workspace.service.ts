import { Injectable} from '@angular/core';

import {
  ActionStore,
  EntityStoreFilterSelectionStrategy
} from '@igo2/common';
import {
  FeatureMotion,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  FeatureDataSource,
  IgoMap,
  VectorLayer
} from '@igo2/geo';
import { ContextState } from '@igo2/integration';

import {
  Client,
  ClientParcel,
  ClientParcelWorkspace,
  createParcelLayer,
  createClientDefaultSelectionStyle,
  FeatureStoreFilterNotOwnedStrategy
} from 'src/lib/client';

import { ClientParcelTableService } from './client-parcel-table.service';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelWorkspaceService {

  static viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];

  constructor(
    private clientParcelTableService: ClientParcelTableService,
    private contextState: ContextState
  ) {}

  createParcelWorkspace(client: Client,  map: IgoMap): ClientParcelWorkspace {
    return new ClientParcelWorkspace({
      id: `fadq.${client.info.numero}-1-parcel-workspace`,
      title: `${client.info.numero} - Parcelles`,
      entityStore: this.createParcelStore(client, map),
      actionStore: this.createParcelActionStore(),
      meta: {
        client,
        map,
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

    store.addStrategy(this.createLoadingStrategy(), true);
    store.addStrategy(this.createSelectionStrategy(client, map), false);
    store.addStrategy(this.createFilterSelectionStrategy(), false);

    const context = this.contextState.context$.value;
    store.addStrategy(this.createFilterNotOwnedStrategy(), context.uri === 'mesurage');

    return store;
  }

  private createParcelActionStore(): ActionStore {
    return new ActionStore([]);
  }

  private createLoadingStrategy(): FeatureStoreLoadingStrategy {
    return new FeatureStoreLoadingStrategy({
      viewScale: [0, 0, 0.8, 0.6]
    });
  }

  private createSelectionStrategy(client: Client, map: IgoMap): FeatureStoreSelectionStrategy {
    return new FeatureStoreSelectionStrategy({
      map: map,
      layer: new VectorLayer({
        title: `${client.info.numero} - Parcelles sélectionnées`,
        zIndex: 102,
        source: new FeatureDataSource(),
        style: createClientDefaultSelectionStyle(),
        showInLayerList: false,
        removable: false,
        browsable: false
      }),
      many: true,
      motion: FeatureMotion.None,
      dragBox: true
    });
  }

  private createFilterSelectionStrategy(): EntityStoreFilterSelectionStrategy {
    return new EntityStoreFilterSelectionStrategy({});
  }

  private createFilterNotOwnedStrategy(): FeatureStoreFilterNotOwnedStrategy {
    return new FeatureStoreFilterNotOwnedStrategy({});
  }
}
