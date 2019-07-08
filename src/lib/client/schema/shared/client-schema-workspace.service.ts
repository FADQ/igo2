import { Injectable} from '@angular/core';

import { ActionStore, EntityStore } from '@igo2/common';

import { Client } from '../../shared/client.interfaces';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaWorkspace } from './client-schema-workspace';
import { ClientSchemaTableService } from './client-schema-table.service';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaWorkspaceService {

  constructor(private clientSchemaTableService: ClientSchemaTableService) {}

  createSchemaWorkspace(client: Client): ClientSchemaWorkspace {
    return new ClientSchemaWorkspace({
      id: `fadq.${client.info.numero}-3-schema-workspace`,
      title: `${client.info.numero} - Schémas`,
      entityStore: this.createSchemaStore(client),
      actionStore: this.createSchemaActionStore(),
      meta: {
        client,
        type: 'schema',
        tableTemplate: this.clientSchemaTableService.buildTable()
      }
    });
  }

  private createSchemaStore(client: Client): EntityStore<ClientSchema> {
    const store = new EntityStore<ClientSchema>([]);
    store.view.sort({
      valueAccessor: (schema: ClientSchema) => schema.id,
      direction: 'desc'
    });

    return store;
  }

  private createSchemaActionStore(): ActionStore {
    return new ActionStore([]);
  }

}
