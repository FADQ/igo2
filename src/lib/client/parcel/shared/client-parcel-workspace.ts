import { Observable } from 'rxjs';

import { EntityTableTemplate, Workspace, WorkspaceOptions } from '@igo2/common';
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
    this.parcelStore.activateStrategyOfType(FeatureStoreLoadingStrategy);
    this.addParcelLayer();
  }

  teardown() {
    this.deactivate();
    this.parcelStore.deactivateStrategyOfType(FeatureStoreLoadingStrategy);
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
    this.parcelStore.activateStrategyOfType(FeatureStoreSelectionStrategy);
  }

  deactivate() {
    super.deactivate();
    this.parcelStore.deactivateStrategyOfType(FeatureStoreSelectionStrategy);
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
