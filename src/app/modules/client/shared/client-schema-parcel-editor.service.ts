import { Injectable } from '@angular/core';

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
  ClientSchemaParcel,
  ClientSchemaParcelTableService,
  createSchemaParcelLayer,
  createClientDefaultSelectionStyle
} from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaParcelEditorService {

  static viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];

  private sharedLoadingStrategy: FeatureStoreLoadingStrategy;

  private sharedSelectionStrategy: FeatureStoreSelectionStrategy;

  constructor(private clientSchemaParcelTableService: ClientSchemaParcelTableService) {}

  createSchemaParcelEditor(client: Client,  map: IgoMap): Editor<ClientSchemaParcel> {
    if (this.sharedLoadingStrategy === undefined) {
      this.sharedLoadingStrategy = this.createSharedLoadingStrategy();
    }

    if (this.sharedSelectionStrategy === undefined) {
      this.sharedSelectionStrategy = this.createSharedSelectionStrategy(map);
    }

    return new Editor<ClientSchemaParcel>({
      id: `fadq.${client.info.numero}-3-schema-parcel-editor`,
      title: `${client.info.numero} - Parcelles du schémas`,
      tableTemplate: this.clientSchemaParcelTableService.buildTable(),
      entityStore: this.createSchemaParcelStore(client, map),
      actionStore: this.createSchemaParcelActionStore(),
      meta: {client, type: 'schemaElement'}
    });
  }

  private createSchemaParcelStore(client: Client, map: IgoMap): FeatureStore<ClientSchemaParcel> {
    const store = new FeatureStore<ClientSchemaParcel>([], {
      getKey: (entity: ClientSchemaParcel) => {
        return entity.properties.idElementGeometrique || entity.meta.id;
      },
      map
    });

    const layer = createSchemaParcelLayer(client);
    store.bindLayer(layer);

    store.addStrategy(this.sharedLoadingStrategy, true);
    store.addStrategy(this.sharedSelectionStrategy, true);

    return store;
  }

  private createSchemaParcelActionStore(): ActionStore {
    return new ActionStore([]);
  }

  private createSharedLoadingStrategy(): FeatureStoreLoadingStrategy {
    return new FeatureStoreLoadingStrategy({
      viewScale: ClientSchemaParcelEditorService.viewScale
    });
  }

  private createSharedSelectionStrategy(map: IgoMap): FeatureStoreSelectionStrategy {
    return new FeatureStoreSelectionStrategy({
      map: map,
      layer: new VectorLayer({
        title: `Parcelles du schéma sélectionnées`,
        zIndex: 104,
        source: new FeatureDataSource(),
        style: createClientDefaultSelectionStyle(),
        showInLayerList: false,
        removable: false,
        browsable: false
      }),
      many: true,
      viewScale: ClientSchemaParcelEditorService.viewScale,
      areaRatio: 0.004,
      dragBox: true
    });
  }

}
