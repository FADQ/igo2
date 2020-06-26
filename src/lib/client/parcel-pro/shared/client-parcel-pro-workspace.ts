
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
import { ClientParcelPro } from './client-parcel-pro.interfaces';

export interface ClientParcelProWorkspaceOptions extends WorkspaceOptions {
  meta: {
    client: Client;
    map: IgoMap;
    type: string;
    tableTemplate: EntityTableTemplate;
    transaction: EntityTransaction;
  };
}

export class ClientParcelProWorkspace extends Workspace<ClientParcelPro> {

  get map(): IgoMap {
    return this.meta.map;
  }

  get parcelProStore(): FeatureStore<ClientParcelPro> {
    return this.entityStore as FeatureStore<ClientParcelPro>;
  }

  get transaction(): EntityTransaction {
    return this.options.meta.transaction;
  }

  constructor(protected options: ClientParcelProWorkspaceOptions) {
    super(options);
  }

  init() {
    this.parcelProStore.activateStrategyOfType(FeatureStoreLoadingStrategy);
    this.addParcelProLayer();
  }

  teardown() {
    this.deactivate();
    this.parcelProStore.deactivateStrategyOfType(FeatureStoreLoadingStrategy);
    this.removeParcelProLayer();
    this.parcelProStore.layer.ol.getSource().clear();
    this.parcelProStore.clear();
  }

  load(parcelPros: ClientParcelPro[]) {
    this.parcelProStore.load(parcelPros);
  }

  activate() {
    super.activate();
    this.parcelProStore.activateStrategyOfType(FeatureStoreSelectionStrategy);
  }

  deactivate() {
    super.deactivate();
    this.parcelProStore.deactivateStrategyOfType(FeatureStoreSelectionStrategy);
    this.parcelProStore.state.clear();
  }

  private addParcelProLayer() {
    if (this.parcelProStore.layer.map === undefined) {
      this.map.addLayer(this.parcelProStore.layer);
    }
  }

  private removeParcelProLayer() {
    if (this.parcelProStore.layer.map !== undefined) {
      this.map.removeLayer(this.parcelProStore.layer);
    }
  }

}
