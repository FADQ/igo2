import { Injectable } from '@angular/core';

import { ActionStore } from '@igo2/common/action';
import { EntityStoreFilterSelectionStrategy, EntityTransaction } from '@igo2/common/entity';
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
import { asEntityStore } from '@lib/shared/entity/entity-store.adapter';
import { entityKey } from '@lib/shared/entity/entity-key.utils';
import { asStrategy } from '@lib/compatibility/strategy.adapter';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementWorkspaceService {

  constructor(
    private clientSchemaElementTableService: ClientSchemaElementTableService
  ) {}

  createSchemaElementWorkspace(client: Client, map: IgoMap): ClientSchemaElementWorkspace {
    // TODO: i18n
    return new ClientSchemaElementWorkspace({
      id: `fadq.${client.info.numero}-4-schema-element-workspace`,
      title: `${client.info.numero} - Éléments du schéma`,
      entityStore: asEntityStore(this.createSchemaElementStore(client, map)),
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
      getKey: entityKey<ClientSchemaElement>(e => e.properties.idElementGeometrique || e.meta.id),
      map
    });

    const layer = createSchemaElementLayer(client);
    store.bindLayer(layer);

    store.addStrategy(asStrategy(this.createLoadingStrategy()), true);
    store.addStrategy(asStrategy(this.createSelectionStrategy(client, map)), false);
    store.addStrategy(this.createFilterSelectionStrategy(), false);

    return store;
  }

  private createSchemaElementActionStore(): ActionStore {
    return new ActionStore([]);
  }

  private createLoadingStrategy(): FeatureStoreLoadingStrategy {
    return new FeatureStoreLoadingStrategy({
      motion: FeatureMotion.None
    });
  }

  private createSelectionStrategy(client: Client, map: IgoMap): FeatureStoreSelectionStrategy {
    // TODO: i18n
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

  private createFilterSelectionStrategy(): EntityStoreFilterSelectionStrategy {
    return new EntityStoreFilterSelectionStrategy({});
  }

}
