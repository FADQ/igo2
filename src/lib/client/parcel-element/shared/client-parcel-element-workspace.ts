
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
    (this.parcelElementStore as any)
      .deactivateStrategyOfType?.(FeatureStoreSelectionStrategy);
  }

  private addParcelElementLayer() {
    if (this.parcelElementStore.layer.map === undefined) {
      this.map.addLayer(this.parcelElementStore.layer);
    }
  }

  private removeParcelElementLayer() {
    if (this.parcelElementStore.layer.map !== undefined) {
      this.map.removeLayer(this.parcelElementStore.layer);
    }
  }

}
