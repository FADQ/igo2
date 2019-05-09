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

  constructor(private clientParcelTableService: ClientParcelTableService) {}

  createParcelEditor(client: Client, map: IgoMap): Editor<ClientParcel> {
    return new Editor<ClientParcel>({
      id: `fadq.client-parcel-editor-1-${client.info.numero}`,
      title: `${client.info.numero} - Parcelles`,
      tableTemplate: this.clientParcelTableService.buildTable(),
      entityStore: this.createParcelStore(client, map),
      actionStore: this.createParcelActionStore()
    });
  }

  private createParcelStore(client: Client, map: IgoMap): FeatureStore<ClientParcel> {
    const store = new FeatureStore<ClientParcel>(client.parcels, {
      getKey: (entity: ClientParcel) => entity.properties.id,
      map
    });
    store.view.sort({
      valueAccessor: (parcel: ClientParcel) => parcel.properties.noParcelleAgricole,
      direction: 'asc'
    });

    const layer = createParcelLayer();
    store.bindLayer(layer);

    const viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];
    const loadingStrategy = new FeatureStoreLoadingStrategy({
      viewScale
    });
    store.addStrategy(loadingStrategy, true);

    const selectionStrategy = new FeatureStoreSelectionStrategy({
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
      viewScale,
      areaRatio: 0.004
    });
    store.addStrategy(selectionStrategy, true);

    return store;
  }

  private createParcelActionStore(): ActionStore {
    return new ActionStore([]);
  }
}
