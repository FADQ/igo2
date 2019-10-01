import {
  EntityTableTemplate,
  EntityTransaction,
  Workspace,
  WorkspaceOptions
} from '@igo2/common';
import {
  IgoMap,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy
} from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientSchemaElement } from './client-schema-element.interfaces';

export interface ClientSchemaElementWorkspaceOptions extends WorkspaceOptions {
  meta: {
    client: Client;
    map: IgoMap;
    type: string;
    tableTemplate: EntityTableTemplate;
    transaction: EntityTransaction;
  };
}

export class ClientSchemaElementWorkspace extends Workspace<ClientSchemaElement> {

  get map(): IgoMap {
    return this.meta.map;
  }

  get schemaElementStore(): FeatureStore<ClientSchemaElement> {
    return this.entityStore as FeatureStore<ClientSchemaElement>;
  }

  get transaction(): EntityTransaction {
    return this.options.meta.transaction;
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
