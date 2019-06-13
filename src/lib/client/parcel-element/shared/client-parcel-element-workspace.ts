import { EntityTableTemplate, Workspace, WorkspaceOptions } from '@igo2/common';
import { FeatureStore } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElement } from './client-parcel-element.interfaces';
import { ClientParcelElementService } from './client-parcel-element.service';

export interface ClientParcelElementWorkspaceOptions extends WorkspaceOptions {
  meta: {
    client: Client;
    type: 'parcelElement',
    tableTemplate: EntityTableTemplate;
    parcelElementService: ClientParcelElementService;
  };
}

export class ClientParcelElementWorkspace extends Workspace<ClientParcelElement> {

  get parcelElementService(): ClientParcelElementService {
    return this.options.meta.parcelElementService;
  }

  constructor(protected options: ClientParcelElementWorkspaceOptions) {
    super(options);
  }

  loadParcelElements() {
    this.parcelElementService.getParcelElements(this.meta.client)
      .subscribe((parcelElements: ClientParcelElement[]) => {
        const store = this.entityStore as FeatureStore<ClientParcelElement>;
        store.load(parcelElements);
      });
  }
}
