import { EntityTableTemplate } from '@igo2/common/entity';
import { Workspace, WorkspaceOptions } from '@igo2/common/workspace';
import {
  IgoMap,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy
} from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcel } from './client-parcel.interfaces';

export interface ClientParcelWorkspaceOptions extends WorkspaceOptions {
  meta: {
    client: Client;
    map: IgoMap;
    type: string;
    tableTemplate: EntityTableTemplate;
  };
}

export class ClientParcelWorkspace extends Workspace<ClientParcel> {

  get client(): Client {
    return this.meta.client;
  }

  get map(): IgoMap {
    return this.meta.map;
  }

  get parcelStore(): FeatureStore<ClientParcel> {
    return this.entityStore as FeatureStore<ClientParcel>;
  }

  constructor(protected options: ClientParcelWorkspaceOptions) {
    super(options);
  }

  init() {
    this.parcelStore.activateStrategyOfType(FeatureStoreLoadingStrategy as any);
    this.addParcelLayer();
  }

  teardown() {
    this.deactivate();
    this.parcelStore.deactivateStrategyOfType(FeatureStoreLoadingStrategy as any);
    this.removeParcelLayer();
    this.deactivate();
    this.parcelStore.layer.ol.getSource().clear();
    this.parcelStore.clear();
  }

  load(parcels: ClientParcel[]) {
    this.parcelStore.load(parcels);
  }

  activate() {
    super.activate();
    this.parcelStore.activateStrategyOfType(FeatureStoreSelectionStrategy as any);
  }

  deactivate() {
    super.deactivate();
    this.parcelStore.deactivateStrategyOfType(FeatureStoreSelectionStrategy as any);
    this.parcelStore.state.clear();
  }

  private addParcelLayer() {
    if (this.parcelStore.layer.map === undefined) {
      this.map.addLayer(this.parcelStore.layer);
    }
  }

  private removeParcelLayer() {
    if (this.parcelStore.layer.map !== undefined) {
      this.map.removeLayer(this.parcelStore.layer);
    }
  }

}
