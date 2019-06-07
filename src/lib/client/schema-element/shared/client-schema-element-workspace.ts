import { concatMap, map } from 'rxjs/operators';

import { EntityTableTemplate, Workspace, WorkspaceOptions } from '@igo2/common';
import { FeatureStore } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElement, ClientSchemaElementTypes } from './client-schema-element.interfaces';
import { ClientSchemaElementService } from './client-schema-element.service';
import { createSchemaElementLayerStyle } from './client-schema-element.utils';

export interface ClientSchemaElementWorkspaceOptions extends WorkspaceOptions {
  meta: {
    client: Client;
    type: 'schemaElement',
    tableTemplate: EntityTableTemplate;
    schemaElementService: ClientSchemaElementService;
  };
}

export class ClientSchemaElementWorkspace extends Workspace<ClientSchemaElement> {

  get schemaElementService(): ClientSchemaElementService {
    return this.options.meta.schemaElementService;
  }

  constructor(protected options: ClientSchemaElementWorkspaceOptions) {
    super(options);
  }

  loadSchemaElements(schema: ClientSchema) {
    this.schemaElementService.getSchemaElementTypes(schema.type)
      .pipe(
        concatMap((types: ClientSchemaElementTypes) => {
          return this.schemaElementService.getElements(schema).pipe(
            map((elements: ClientSchemaElement[]) => [types, elements])
          );
        })
      )
      .subscribe((bunch: [ClientSchemaElementTypes, ClientSchemaElement[]]) => {
        const [types, elements] = bunch;
        const olStyle = createSchemaElementLayerStyle(types);
        const store = this.entityStore as FeatureStore<ClientSchemaElement>;
        store.layer.ol.setStyle(olStyle);
        store.load(elements);
      });
  }
}
