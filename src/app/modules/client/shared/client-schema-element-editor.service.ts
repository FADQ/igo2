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
  ClientSchemaElement,
  ClientSchemaElementTableService,
  createSchemaElementLayer,
  createClientDefaultSelectionStyle
} from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementEditorService {

  static viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];

  private sharedLoadingStrategy: FeatureStoreLoadingStrategy;

  private sharedSelectionStrategy: FeatureStoreSelectionStrategy;

  constructor(private clientSchemaElementTableService: ClientSchemaElementTableService) {}

  createSchemaElementEditor(client: Client,  map: IgoMap): Editor<ClientSchemaElement> {
    if (this.sharedLoadingStrategy === undefined) {
      this.sharedLoadingStrategy = this.createSharedLoadingStrategy();
    }

    if (this.sharedSelectionStrategy === undefined) {
      this.sharedSelectionStrategy = this.createSharedSelectionStrategy(map);
    }

    return new Editor<ClientSchemaElement>({
      id: `fadq.${client.info.numero}-3-schema-element-editor`,
      title: `${client.info.numero} - Éléments géométriques`,
      tableTemplate: this.clientSchemaElementTableService.buildTable(),
      entityStore: this.createSchemaElementStore(client, map),
      actionStore: this.createSchemaElementActionStore()
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
      viewScale: ClientSchemaElementEditorService.viewScale
    });
  }

  private createSharedSelectionStrategy(map: IgoMap): FeatureStoreSelectionStrategy {
    return new FeatureStoreSelectionStrategy({
      map: map,
      layer: new VectorLayer({
        title: `Éléments géométriques sélectionnés`,
        zIndex: 104,
        source: new FeatureDataSource(),
        style: createClientDefaultSelectionStyle(),
        showInLayerList: false,
        removable: false,
        browsable: false
      }),
      many: true,
      viewScale: ClientSchemaElementEditorService.viewScale,
      areaRatio: 0.004
    });
  }

}
