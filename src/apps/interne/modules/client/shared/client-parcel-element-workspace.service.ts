import { Injectable } from '@angular/core';

import { ActionStore } from '@igo2/common/action';
import { EntityTransaction, EntityStoreFilterSelectionStrategy } from '@igo2/common/entity';
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
  ClientParcelElement,
  ClientParcelElementWorkspace,
  createClientDefaultSelectionStyle,
  createParcelElementLayer
} from 'src/lib/client';

import { asEntityStore } from '@lib/shared/entity/entity-store.adapter';

import { ClientParcelElementTableService } from './client-parcel-element-table.service';
import { entityKey } from '@lib/shared/entity/entity-key.utils';
import { asStrategy } from '@lib/compatibility/strategy.adapter';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelElementWorkspaceService {

  constructor(
    private clientParcelElementTableService: ClientParcelElementTableService
  ) {}

  createParcelElementWorkspace(client: Client, map: IgoMap): ClientParcelElementWorkspace {
    // TODO: i18n

    // Type is set to parcel. This allows us to switch from a client to another and
    // activate the parcel element workspace if the previous client's active workspace
    // is either the parcel workspace or the parcel element workspace.
    return new ClientParcelElementWorkspace({
      id: `fadq.${client.info.numero}-2-parcel-element-workspace`,
      title: `${client.info.numero} - Parcelles en édition`,
      entityStore: asEntityStore(this.createParcelElementStore(client, map)),
      actionStore: this.createParcelElementActionStore(),
      meta: {
        client,
        map,
        type: 'parcel',
        tableTemplate: this.clientParcelElementTableService.buildTable(),
        transaction: new EntityTransaction()
      }
    });
  }

  private createParcelElementStore(client: Client, map: IgoMap): FeatureStore<ClientParcelElement> {
    const store = new FeatureStore<ClientParcelElement>([], {
      getKey: entityKey<ClientParcelElement>(e => e.properties.idParcelle || e.meta.id),
      map
    });

    const layer = createParcelElementLayer(client);
    store.bindLayer(layer);

    store.addStrategy(asStrategy(this.createLoadingStrategy()), true);
    store.addStrategy(asStrategy(this.createSelectionStrategy(client, map)), false);
    store.addStrategy(this.createFilterSelectionStrategy(), false);

    return store;
  }

  private createParcelElementActionStore(): ActionStore {
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
        title: `${client.info.numero} - Parcelles en édition sélectionnées`,
        zIndex: 104,
        source: new FeatureDataSource(),
        style: createClientDefaultSelectionStyle(),
        showInLayerList: false,
        removable: false,
        browsable: false
      }),
      motion: FeatureMotion.None,
      many: true,
      dragBox: true
    });
  }

  private createFilterSelectionStrategy(): EntityStoreFilterSelectionStrategy {
    return new EntityStoreFilterSelectionStrategy({});
  }

}
