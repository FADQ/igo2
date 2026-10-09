import { EntityTableTemplate, EntityTransaction } from '@igo2/common/entity';
import { Workspace, WorkspaceOptions } from '@igo2/common/workspace';
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

  load(schemaElements: ClientSchemaElement[]) {
    this.schemaElementStore.load(schemaElements);
  }

  init() {
    this.schemaElementStore.activateStrategyOfType(FeatureStoreLoadingStrategy as any);
    this.addSchemaElementLayer();
  }

  teardown() {
    this.deactivate();
    this.schemaElementStore.deactivateStrategyOfType(FeatureStoreLoadingStrategy as any);
    this.removeSchemaElementLayer();
    this.schemaElementStore.layer.ol.getSource().clear();
    this.schemaElementStore.clear();
  }

  activate() {
    super.activate();
    this.schemaElementStore.activateStrategyOfType(
      FeatureStoreSelectionStrategy as any
    );
  }

  deactivate() {
    const strategy = this.schemaElementStore.getStrategyOfType(
      FeatureStoreSelectionStrategy as any
    ) as any;

    strategy.unselectAll();
    strategy.clear();

    super.deactivate();
  }

  private addSchemaElementLayer() {
    if (!this.map.layerController.getById(this.schemaElementStore.layer.id)) {
      this.map.layerController.add(this.schemaElementStore.layer);
      
      // Ajustement à faire pour la version 18.0.0.
      // À voir ultérieurement si c'est nécessaire dans les autres versions.
      const strategy = this.schemaElementStore.getStrategyOfType(
        FeatureStoreSelectionStrategy as any
      ) as any;

      strategy.overlayStore.layer.options.isIgoInternalLayer = true;
    }
  }

  private removeSchemaElementLayer() {
  if (this.map.layerController.getById(this.schemaElementStore.layer.id)) {
      this.map.layerController.remove(this.schemaElementStore.layer);
    }
  }
}
