import { Injectable } from '@angular/core';

import { ActionStore, EntityTransaction } from '@igo2/common';
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
  ClientSchemaElement,
  ClientSchemaElementWorkspace,
  createClientDefaultSelectionStyle,
  createSchemaElementLayer
} from 'src/lib/client';

import { ClientSchemaElementTableService } from './client-schema-element-table.service';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementWorkspaceService {

  static viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];

  constructor(
    private clientSchemaElementTableService: ClientSchemaElementTableService
  ) {}

  createSchemaElementWorkspace(client: Client,  map: IgoMap): ClientSchemaElementWorkspace {
    return new ClientSchemaElementWorkspace({
      id: `fadq.${client.info.numero}-4-schema-element-workspace`,
      title: `${client.info.numero} - Éléments du schémas`,
      entityStore: this.createSchemaElementStore(client, map),
      actionStore: this.createSchemaElementActionStore(),
      meta: {
        client,
        map,
        type: 'schemaElement',
        tableTemplate: this.clientSchemaElementTableService.buildTable(),
        transaction: new EntityTransaction()
      }
    });
  }

  private createSchemaElementStore(client: Client, map: IgoMap): FeatureStore<ClientSchemaElement> {
    const store = new FeatureStore<ClientSchemaElement>([], {
      getKey: (entity: ClientSchemaElement) => {
        return entity.properties.idElementGeometrique || entity.meta.id;
      },
      map
    });

    const layer = createSchemaElementLayer(client);
    store.bindLayer(layer);

    store.addStrategy(this.createLoadingStrategy(), true);
    store.addStrategy(this.createSelectionStrategy(client, map), false);

    return store;
  }

  private createSchemaElementActionStore(): ActionStore {
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
        title: `${client.info.numero} - Éléments du schéma sélectionnés`,
        zIndex: 104,
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
