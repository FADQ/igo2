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
    this.parcelStore.layer.ol.getSource().clear();
    this.parcelStore.clear();
  }

  load(parcels: ClientParcel[]) {
    this.parcelStore.load(parcels);
  }

  activate() {
    super.activate();

    const strategy = this.parcelStore.getStrategyOfType(
      FeatureStoreSelectionStrategy as any
    ) as any;

    this.parcelStore.activateStrategyOfType(
      FeatureStoreSelectionStrategy as any
    );
  }

  deactivate() {
    const strategy = this.parcelStore.getStrategyOfType(
      FeatureStoreSelectionStrategy as any
    ) as any;

    strategy.unselectAll();
    strategy.clear();

    super.deactivate();
  }

  private addParcelLayer() {
    if (!this.map.layerController.getById(this.parcelStore.layer.id)) {
      this.map.layerController.add(this.parcelStore.layer);
      
      // Ajustement à faire pour la version 18.0.0.
      // À voir ultérieurement si c'est nécessaire dans les autres versions.
      const strategy = this.parcelStore.getStrategyOfType(
        FeatureStoreSelectionStrategy as any
      ) as any;

      strategy.overlayStore.layer.options.isIgoInternalLayer = true;
    }
  }

  private removeParcelLayer() {
    if (this.map.layerController.getById(this.parcelStore.layer.id)) {
      this.map.layerController.remove(this.parcelStore.layer);
    }
  }

}
