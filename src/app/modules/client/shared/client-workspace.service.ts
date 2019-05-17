import { Injectable} from '@angular/core';

import { EditionState, MapState } from '@igo2/integration';

import {
  Client,
  ClientWorkspace,
  ClientWorkspaceOptions,
  ClientResolutionService,
  ClientSchemaElementService,
} from 'src/lib/client';

import { ClientParcelEditorService } from './client-parcel-editor.service';
import { ClientParcelActionsService } from './client-parcel-actions.service';
import { ClientSchemaEditorService } from './client-schema-editor.service';
import { ClientSchemaActionsService } from './client-schema-actions.service';
import { ClientSchemaElementEditorService } from './client-schema-element-editor.service';
import { ClientSchemaElementActionsService } from './client-schema-element-actions.service';
import { ClientSchemaParcelEditorService } from './client-schema-parcel-editor.service';
import { ClientSchemaParcelActionsService } from './client-schema-parcel-actions.service';

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
    private clientSchemaParcelEditorService: ClientSchemaParcelEditorService,
    private clientSchemaParcelActionsService: ClientSchemaParcelActionsService,
    private clientResolutionService: ClientResolutionService
  ) {}

  createClientWorkspace(client: Client, options: Partial<ClientWorkspaceOptions> = {}): ClientWorkspace {
    const map = this.mapState.map;
    const parcelEditor = this.clientParcelEditorService.createParcelEditor(client, map);
    const schemaEditor = this.clientSchemaEditorService.createSchemaEditor(client);
    const schemaElementEditor = this.clientSchemaElementEditorService.createSchemaElementEditor(client, map);
    const schemaElementService = this.clientSchemaElementService;
    const schemaParcelEditor = this.clientSchemaParcelEditorService.createSchemaParcelEditor(client, map);
    const resolutionService = this.clientResolutionService;

    const workspace = new ClientWorkspace({
      map,
      editorStore: this.editionState.store,
      client,
      parcelEditor,
      schemaEditor,
      schemaElementEditor,
      schemaElementService,
      schemaParcelEditor,
      resolutionService,
      // moveToParcels: options.moveToParcels
    });

    const parcelActions = this.clientParcelActionsService.buildActions(workspace);
    parcelEditor.actionStore.load(parcelActions);

    const schemaActions = this.clientSchemaActionsService.buildActions(workspace);
    schemaEditor.actionStore.load(schemaActions);

    const schemaElementActions = this.clientSchemaElementActionsService.buildActions(workspace);
    schemaElementEditor.actionStore.load(schemaElementActions);

    const schemaParcelActions = this.clientSchemaParcelActionsService.buildActions(workspace);
    schemaParcelEditor.actionStore.load(schemaParcelActions);

    return workspace;
  }

}
