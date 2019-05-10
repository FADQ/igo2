import { Injectable} from '@angular/core';

import { ActionStore, Editor } from '@igo2/common';
import {
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
  ClientParcelTableService,
  createParcelLayer,
  createClientDefaultSelectionStyle
} from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelEditorService {

  static viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];

  private sharedLoadingStrategy: FeatureStoreLoadingStrategy;

  private sharedSelectionStrategy: FeatureStoreSelectionStrategy;

  constructor(private clientParcelTableService: ClientParcelTableService) {}

  createParcelEditor(client: Client,  map: IgoMap): Editor<ClientParcel> {
    if (this.sharedLoadingStrategy === undefined) {
      this.sharedLoadingStrategy = this.createSharedLoadingStrategy();
    }

    if (this.sharedSelectionStrategy === undefined) {
      this.sharedSelectionStrategy = this.createSharedSelectionStrategy(map);
    }

    return new Editor<ClientParcel>({
      id: `fadq.${client.info.numero}-1-parcel-editor`,
      title: `${client.info.numero} - Parcelles`,
      tableTemplate: this.clientParcelTableService.buildTable(),
      entityStore: this.createParcelStore(client, map),
      actionStore: this.createParcelActionStore()
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
      viewScale: ClientParcelEditorService.viewScale
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
      viewScale: ClientParcelEditorService.viewScale,
      areaRatio: 0.004
    });
  }
}
