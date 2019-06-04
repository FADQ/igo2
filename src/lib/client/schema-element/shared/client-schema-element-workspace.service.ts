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
import { ClientSchemaElement } from './client-schema-element.interfaces';
import { ClientSchemaElementService } from './client-schema-element.service';
import { ClientSchemaElementTableService } from './client-schema-element-table.service';
import { createSchemaElementLayer } from './client-schema-element.utils';

import { ClientSchemaElementWorkspace } from './client-schema-element-workspace';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementWorkspaceService {

  static viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];

  private sharedLoadingStrategy: FeatureStoreLoadingStrategy;

  private sharedSelectionStrategy: FeatureStoreSelectionStrategy;

  constructor(
    private clientSchemaElementService: ClientSchemaElementService,
    private clientSchemaElementTableService: ClientSchemaElementTableService
  ) {}

  createSchemaElementWorkspace(client: Client,  map: IgoMap): ClientSchemaElementWorkspace {
    if (this.sharedLoadingStrategy === undefined) {
      this.sharedLoadingStrategy = this.createSharedLoadingStrategy();
    }

    if (this.sharedSelectionStrategy === undefined) {
      this.sharedSelectionStrategy = this.createSharedSelectionStrategy(map);
    }

    return new ClientSchemaElementWorkspace({
      id: `fadq.${client.info.numero}-4-schema-element-workspace`,
      title: `${client.info.numero} - Éléments du schémas`,
      entityStore: this.createSchemaElementStore(client, map),
      actionStore: this.createSchemaElementActionStore(),
      meta: {
        client,
        type: 'schemaElement',
        tableTemplate: this.clientSchemaElementTableService.buildTable(),
        schemaElementService: this.clientSchemaElementService
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

    store.addStrategy(this.sharedLoadingStrategy, true);
    store.addStrategy(this.sharedSelectionStrategy, true);

    return store;
  }

  private createSchemaElementActionStore(): ActionStore {
    return new ActionStore([]);
  }

  private createSharedLoadingStrategy(): FeatureStoreLoadingStrategy {
    return new FeatureStoreLoadingStrategy({
      viewScale: ClientSchemaElementWorkspaceService.viewScale
    });
  }

  private createSharedSelectionStrategy(map: IgoMap): FeatureStoreSelectionStrategy {
    return new FeatureStoreSelectionStrategy({
      map: map,
      layer: new VectorLayer({
        title: `Éléments du schéma sélectionnés`,
        zIndex: 104,
        source: new FeatureDataSource(),
        style: createClientDefaultSelectionStyle(),
        showInLayerList: false,
        removable: false,
        browsable: false
      }),
      many: true,
      viewScale: ClientSchemaElementWorkspaceService.viewScale,
      areaRatio: 0.004,
      dragBox: true
    });
  }

}
