import { Injectable} from '@angular/core';

import { ActionStore, EntityStore, Editor } from '@igo2/common';

import {
  Client,
  ClientSchema,
  ClientSchemaTableService
} from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaEditorService {

  constructor(private clientSchemaTableService: ClientSchemaTableService) {}

  createSchemaEditor(client: Client): Editor<ClientSchema> {
    return new Editor<ClientSchema>({
      id: `fadq.client-schema-editor-2-${client.info.numero}`,
      title: `${client.info.numero} - Schémas`,
      tableTemplate: this.clientSchemaTableService.buildTable(),
      entityStore: this.createSchemaStore(client),
      actionStore: this.createSchemaActionStore()
    });
  }

  private createSchemaStore(client: Client): EntityStore<ClientSchema> {
    const store = new EntityStore<ClientSchema>(client.schemas);
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
