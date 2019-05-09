import { Injectable} from '@angular/core';

import { EditionState, MapState } from '@igo2/integration';

import {
  Client,
  ClientSchemaElementService
} from 'src/lib/client';

import { ClientWorkspace } from './client-workspace';
import { ClientParcelEditorService } from './client-parcel-editor.service';
import { ClientParcelActionsService } from './client-parcel-actions.service';
import { ClientSchemaEditorService } from './client-schema-editor.service';
import { ClientSchemaActionsService } from './client-schema-actions.service';
import { ClientSchemaElementEditorService } from './client-schema-element-editor.service';
import { ClientSchemaElementActionsService } from './client-schema-element-actions.service';
import { ClientResolutionService } from './client-resolution.service';

@Injectable({
  providedIn: 'root'
})
export class ClientWorkspaceService {

  constructor(
    private editionState: EditionState,
    private mapState: MapState,
    private clientParcelEditorService: ClientParcelEditorService,
    private clientParcelActionsService: ClientParcelActionsService,
    private clientSchemaEditorService: ClientSchemaEditorService,
    private clientSchemaActionsService: ClientSchemaActionsService,
    private clientSchemaElementEditorService: ClientSchemaElementEditorService,
    private clientSchemaElementActionsService: ClientSchemaElementActionsService,
    private clientSchemaElementService: ClientSchemaElementService,
    private clientResolutionService: ClientResolutionService
  ) {}

  createClientWorkspace(client: Client): ClientWorkspace {
    const map = this.mapState.map;
    const parcelEditor = this.clientParcelEditorService.createParcelEditor(client, map);
    const schemaEditor = this.clientSchemaEditorService.createSchemaEditor(client);
    const schemaElementEditor = this.clientSchemaElementEditorService.createSchemaElementEditor(client, map);
    const schemaElementService = this.clientSchemaElementService;
    const resolutionService = this.clientResolutionService;

    const workspace = new ClientWorkspace({
      map,
      editorStore: this.editionState.store,
      client,
      parcelEditor,
      schemaEditor,
      schemaElementEditor,
      schemaElementService,
      resolutionService
    });

    this.clientParcelActionsService.loadParcelActions(workspace);
    this.clientSchemaActionsService.loadSchemaActions(workspace);
    this.clientSchemaElementActionsService.loadSchemaElementActions(workspace);

    return workspace;
  }
}
