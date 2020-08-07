import { Injectable} from '@angular/core';

import {
  ActionStore,
  EntityTransaction,
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

import {
  Client,
  ClientParcelPro,
  ClientParcelProWorkspace,
  createParcelProLayer,
  createParcelProLayerStyle,
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
  createParcelWorkspace(client: Client,  map: IgoMap): ClientParcelProWorkspace {
    // TODO: i18n
    return new ClientParcelProWorkspace({
      id: `fadq.${client.info.numero}-1-parcel-workspace`,
      title: `${client.info.numero} - Parcelles`,
      entityStore: this.createParcelStore(client, map),
      actionStore: this.createParcelActionStore(),
      meta: {
        client,
        map,
        type: 'parcel',
        tableTemplate: this.clientParcelTableService.buildTable(),
        transaction: new EntityTransaction()
      }
    });
  }

  /**
   * Create a parcel store
   * @param client Client
   * @param map Igo map
   * @returns Parcel store
   */
  private createParcelStore(client: Client, map: IgoMap): FeatureStore<ClientParcelPro> {
    const store = new FeatureStore<ClientParcelPro>([], {
      getKey: (entity: ClientParcelPro) => entity.properties.id,
      map
    });
    store.view.sort({
      valueAccessor: (parcel: ClientParcelPro) => parcel.properties.noParcelleAgricole,
      direction: 'asc'
    });

    const layer = createParcelProLayer(client);
    const olStyle = createParcelProLayerStyle();
    layer.ol.setStyle(olStyle);
    store.bindLayer(layer);

    store.addStrategy(this.createLoadingStrategy(), true);
    store.addStrategy(this.createSelectionStrategy(client, map), true);
    store.addStrategy(this.createFilterSelectionStrategy());

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

  private createFilterSelectionStrategy(): EntityStoreFilterSelectionStrategy {
    return new EntityStoreFilterSelectionStrategy({});
  }
}
