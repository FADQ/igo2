import { EntityTableTemplate, Workspace, WorkspaceOptions } from '@igo2/common';
import {
  IgoMap,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy
} from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientSchemaElement } from './client-schema-element.interfaces';
import { ClientSchemaElementService } from './client-schema-element.service';

export interface ClientSchemaElementWorkspaceOptions extends WorkspaceOptions {
  meta: {
    client: Client;
    map: IgoMap;
    type: 'schemaElement',
    tableTemplate: EntityTableTemplate;
    schemaElementService: ClientSchemaElementService;
  };
}

export class ClientSchemaElementWorkspace extends Workspace<ClientSchemaElement> {

  get map(): IgoMap {
    return this.meta.map;
  }

  get schemaElementStore(): FeatureStore<ClientSchemaElement> {
    return this.entityStore as FeatureStore<ClientSchemaElement>;
  }

  get schemaElementService(): ClientSchemaElementService {
    return this.options.meta.schemaElementService;
  }

  constructor(protected options: ClientSchemaElementWorkspaceOptions) {
    super(options);
  }

  init() {
    this.schemaElementStore.activateStrategyOfType(FeatureStoreLoadingStrategy);
    this.addSchemaElementLayer();
  }

  teardown() {
    this.deactivate();
    this.schemaElementStore.deactivateStrategyOfType(FeatureStoreLoadingStrategy);
    this.removeSchemaElementLayer();
    this.schemaElementStore.layer.ol.getSource().clear();
    this.schemaElementStore.clear();
  }

  activate() {
    super.activate();
    this.schemaElementStore.activateStrategyOfType(FeatureStoreSelectionStrategy);
  }

  deactivate() {
    super.deactivate();
    this.schemaElementStore.deactivateStrategyOfType(FeatureStoreSelectionStrategy);
    this.schemaElementStore.state.clear();
  }

  private addSchemaElementLayer() {
    if (this.schemaElementStore.layer.map === undefined) {
      this.map.addLayer(this.schemaElementStore.layer);
    }
  }

  private removeSchemaElementLayer() {
    if (this.schemaElementStore.layer.map !== undefined) {
      this.map.removeLayer(this.schemaElementStore.layer);
    }
  }
}
