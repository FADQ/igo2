import { Injectable } from '@angular/core';

import { ActionStore } from '@igo2/common';
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
import { ClientParcelElement } from './client-parcel-element.interfaces';
import { ClientParcelElementWorkspace } from './client-parcel-element-workspace';
import { ClientParcelElementService } from './client-parcel-element.service';
import { ClientParcelElementTableService } from './client-parcel-element-table.service';
import { createParcelElementLayer } from './client-parcel-element.utils';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelElementWorkspaceService {

  static viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];

  private sharedLoadingStrategy: FeatureStoreLoadingStrategy;

  private sharedSelectionStrategy: FeatureStoreSelectionStrategy;

  constructor(
    private clientParcelElementService: ClientParcelElementService,
    private clientParcelElementTableService: ClientParcelElementTableService
  ) {}

  createParcelElementWorkspace(client: Client,  map: IgoMap): ClientParcelElementWorkspace {
    if (this.sharedLoadingStrategy === undefined) {
      this.sharedLoadingStrategy = this.createSharedLoadingStrategy();
    }

    if (this.sharedSelectionStrategy === undefined) {
      this.sharedSelectionStrategy = this.createSharedSelectionStrategy(map);
    }

    return new ClientParcelElementWorkspace({
      id: `fadq.${client.info.numero}-2-parcel-element-workspace`,
      title: `${client.info.numero} - Parcelles en édition`,
      entityStore: this.createParcelElementStore(client, map),
      actionStore: this.createParcelElementActionStore(),
      meta: {
        client,
        type: 'parcelElement',
        tableTemplate: this.clientParcelElementTableService.buildTable(),
        parcelElementService: this.clientParcelElementService
      }
    });
  }

  private createParcelElementStore(client: Client, map: IgoMap): FeatureStore<ClientParcelElement> {
    const store = new FeatureStore<ClientParcelElement>([], {
      getKey: (entity: ClientParcelElement) => {
        return entity.properties.id || entity.meta.id;
      },
      map
    });

    const layer = createParcelElementLayer(client);
    store.bindLayer(layer);

    store.addStrategy(this.sharedLoadingStrategy, true);
    store.addStrategy(this.sharedSelectionStrategy, true);

    return store;
  }

  private createParcelElementActionStore(): ActionStore {
    return new ActionStore([]);
  }

  private createSharedLoadingStrategy(): FeatureStoreLoadingStrategy {
    return new FeatureStoreLoadingStrategy({
      viewScale: ClientParcelElementWorkspaceService.viewScale
    });
  }

  private createSharedSelectionStrategy(map: IgoMap): FeatureStoreSelectionStrategy {
    return new FeatureStoreSelectionStrategy({
      map: map,
      layer: new VectorLayer({
        title: `Parcelles en édition sélectionnées`,
        zIndex: 104,
        source: new FeatureDataSource(),
        style: createClientDefaultSelectionStyle(),
        showInLayerList: false,
        removable: false,
        browsable: false
      }),
      many: true,
      viewScale: ClientParcelElementWorkspaceService.viewScale,
      areaRatio: 0.004,
      dragBox: true
    });
  }

}
