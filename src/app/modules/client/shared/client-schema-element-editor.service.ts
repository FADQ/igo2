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

  constructor(private clientSchemaElementTableService: ClientSchemaElementTableService) {}

  createSchemaElementEditor(client: Client,  map: IgoMap): Editor<ClientSchemaElement> {
    return new Editor<ClientSchemaElement>({
      id: `fadq.client-schema-element-editor-3-${client.info.numero}`,
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

    const layer = createSchemaElementLayer();
    store.bindLayer(layer);

    const viewScale: [number, number, number, number] = [0, 0, 0.8, 0.6];
    const loadingStrategy = new FeatureStoreLoadingStrategy({
      viewScale
    });
    store.addStrategy(loadingStrategy);

    const selectionStrategy = new FeatureStoreSelectionStrategy({
      map: map,
      layer: new VectorLayer({
        title: `${client.info.numero} - Éléments géométriques sélectionnés`,
        zIndex: 104,
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

  private createSchemaElementActionStore(): ActionStore {
    return new ActionStore([]);
  }

}
