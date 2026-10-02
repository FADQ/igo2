
import { EntityTableTemplate, EntityTransaction } from '@igo2/common/entity';
import { Workspace, WorkspaceOptions } from '@igo2/common/workspace';
import {
  IgoMap,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy
} from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElement } from './client-parcel-element.interfaces';

export interface ClientParcelElementWorkspaceOptions extends WorkspaceOptions {
  meta: {
    client: Client;
    map: IgoMap;
    type: string;
    tableTemplate: EntityTableTemplate;
    transaction: EntityTransaction;
  };
}

export class ClientParcelElementWorkspace extends Workspace<any> {

  get map(): IgoMap {
    return this.meta.map;
  }

  get parcelElementStore(): FeatureStore<ClientParcelElement> {
    return this.entityStore as unknown as FeatureStore<ClientParcelElement>;
  }

  get transaction(): EntityTransaction {
    return this.options.meta.transaction;
  }

  constructor(protected options: ClientParcelElementWorkspaceOptions) {
    super(options);
  }

  // init() {
  //   this.parcelElementStore.activateStrategyOfType(FeatureStoreLoadingStrategy);
  //   this.addParcelElementLayer();
  // }

  init() {
    const store = this.parcelElementStore as any;

    store.activateStrategyOfType(FeatureStoreLoadingStrategy);
    this.addParcelElementLayer();
  }

  teardown() {
    this.deactivate();

    const store = this.parcelElementStore as any;

    store.deactivateStrategyOfType?.(FeatureStoreLoadingStrategy);
    store.deactivateStrategyOfType?.(FeatureStoreSelectionStrategy);

    this.removeParcelElementLayer();

    store.layer?.ol?.getSource?.()?.clear?.();
    store.clear?.();
  }

  load(parcelElements: ClientParcelElement[]) {
    this.parcelElementStore.load(parcelElements);
  }

  activate() {
    super.activate();
    (this.parcelElementStore as any)
      .activateStrategyOfType?.(FeatureStoreSelectionStrategy);
  }

  deactivate() {
    super.deactivate();
  }

  private addParcelElementLayer() {
    if (!this.map.layerController.getById(this.parcelElementStore.layer.id)) {
      this.map.layerController.add(this.parcelElementStore.layer);
      
      // Ajustement à faire pour la version 18.0.0.
      // À voir ultérieurement si c'est nécessaire dans les autres versions.
      const strategy = this.parcelElementStore.getStrategyOfType(
        FeatureStoreSelectionStrategy as any
      ) as any;

      strategy.overlayStore.layer.options.isIgoInternalLayer = true;
    }
  }

  private removeParcelElementLayer() {
    if (this.map.layerController.getById(this.parcelElementStore.layer.id)) {
      this.map.layerController.remove(this.parcelElementStore.layer);
    }
  }

}
