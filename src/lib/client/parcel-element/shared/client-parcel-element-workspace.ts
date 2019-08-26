import { Observable } from 'rxjs';

import { EntityTableTemplate, Workspace, WorkspaceOptions } from '@igo2/common';
import {
  IgoMap,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy
} from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElement } from './client-parcel-element.interfaces';
import { ClientParcelElementService } from './client-parcel-element.service';

export interface ClientParcelElementWorkspaceOptions extends WorkspaceOptions {
  meta: {
    client: Client;
    map: IgoMap;
    type: string;
    tableTemplate: EntityTableTemplate;
    parcelElementService: ClientParcelElementService;
  };
}

export class ClientParcelElementWorkspace extends Workspace<ClientParcelElement> {

  get map(): IgoMap {
    return this.meta.map;
  }

  get parcelElementStore(): FeatureStore<ClientParcelElement> {
    return this.entityStore as FeatureStore<ClientParcelElement>;
  }

  get parcelElementService(): ClientParcelElementService {
    return this.options.meta.parcelElementService;
  }

  constructor(protected options: ClientParcelElementWorkspaceOptions) {
    super(options);
  }

  init() {
    this.parcelElementStore.activateStrategyOfType(FeatureStoreLoadingStrategy);
    this.addParcelElementLayer();
  }

  teardown() {
    this.deactivate();
    this.parcelElementStore.deactivateStrategyOfType(FeatureStoreLoadingStrategy);
    this.removeParcelElementLayer();
    this.deactivate();
    this.parcelElementStore.layer.ol.getSource().clear();
    this.parcelElementStore.clear();
  }

  load(parcelElements: ClientParcelElement[]) {
    this.parcelElementStore.load(parcelElements);
  }

  activate() {
    super.activate();
    this.parcelElementStore.activateStrategyOfType(FeatureStoreSelectionStrategy);
  }

  deactivate() {
    super.deactivate();
    this.parcelElementStore.deactivateStrategyOfType(FeatureStoreSelectionStrategy);
    this.parcelElementStore.state.clear();
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
