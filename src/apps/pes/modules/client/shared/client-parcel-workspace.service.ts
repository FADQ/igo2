import { Injectable} from '@angular/core';

import { ActionStore } from '@igo2/common';
import {
  FeatureMotion,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  FeatureDataSource,
  IgoMap,
  VectorLayer
} from '@igo2/geo';

import {
  Client,
  ClientParcel,
  ClientParcelWorkspace,
  createParcelLayer,
  createParcelLayerStyle,
  createClientDefaultSelectionStyle
} from 'src/lib/client';

import { ClientParcelTableService } from './client-parcel-table.service';

/**
 * This is a parcel workspace factory
 */
@Injectable({
  providedIn: 'root'
})
export class ClientParcelWorkspaceService {

  constructor(private clientParcelTableService: ClientParcelTableService) {}

  /**
   * Create a parcel workspace
   * @param client Client
   * @param map Igo map
   * @returns Parcel workspace
   */
  createParcelWorkspace(client: Client, map: IgoMap): ClientParcelWorkspace {
    // TODO: i18n
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

  /**
   * Create a parcel store
   * @param client Client
   * @param map Igo map
   * @returns Parcel store
   */
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
    const olStyle = createParcelLayerStyle();
    layer.ol.setStyle(olStyle);
    store.bindLayer(layer);

    store.addStrategy(this.createLoadingStrategy(), true);
    store.addStrategy(this.createSelectionStrategy(client, map), true);

    return store;
  }

  /**
   * Create n action store. The action store is created empty
   * and actions are defined later because they need the workspace
   * instance.
   * @returns Action store
   */
  private createParcelActionStore(): ActionStore {
    return new ActionStore([]);
  }

  /**
   * Create the parcel store loading strategy
   * @returns Loading strategy
   */
  private createLoadingStrategy(): FeatureStoreLoadingStrategy {
    return new FeatureStoreLoadingStrategy({
      viewScale: [0, 0, 0.8, 0.6]
    });
  }

  /**
   * Create the parcel store selectiong strategy
   * @returns Loading strategy
   */
  private createSelectionStrategy(client: Client, map: IgoMap): FeatureStoreSelectionStrategy {
    // TODO: i18n
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
}
