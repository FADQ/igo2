import {
  EntityStore,
  EntityTableTemplate,
  Workspace,
  WorkspaceOptions
} from '@igo2/common';

import { Client } from '../../shared/client.interfaces';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';

export interface ClientSchemaWorkspaceOptions extends WorkspaceOptions {
  meta: {
    client: Client;
    type: string;
    tableTemplate: EntityTableTemplate;
  };
}

export class ClientSchemaWorkspace extends Workspace<ClientSchema> {

  get client(): Client {
    return this.meta.client;
  }

  get schemaStore(): EntityStore<ClientSchema> {
    return this.entityStore as EntityStore<ClientSchema>;
  }

  constructor(protected options: ClientSchemaWorkspaceOptions) {
    super(options);
  }

  init() {}

  load(schemas: ClientSchema[]) {
    this.schemaStore.load(schemas);
  }

  teardown() {
    this.deactivate();
    this.schemaStore.clear();
  }

}
