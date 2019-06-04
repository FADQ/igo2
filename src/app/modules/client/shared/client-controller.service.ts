import { Injectable} from '@angular/core';

import { MapState } from '@igo2/integration';

import {
  Client,
  ClientController,
  ClientControllerOptions,
  ClientSchemaElementService,
  ClientSchemaElementTransactionService
} from 'src/lib/client';

import {
  ClientParcelWorkspaceService,
  ClientParcelActionsService,
  ClientParcelElementWorkspaceService,
  ClientParcelElementActionsService,
  ClientSchemaWorkspaceService,
  ClientSchemaActionsService,
  ClientSchemaElementWorkspaceService,
  ClientSchemaElementActionsService
} from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientControllerService {

  constructor(
    private mapState: MapState,
    private clientParcelWorkspaceService: ClientParcelWorkspaceService,
    private clientParcelActionsService: ClientParcelActionsService,
    private clientSchemaWorkspaceService: ClientSchemaWorkspaceService,
    private clientSchemaActionsService: ClientSchemaActionsService,
    private clientSchemaElementWorkspaceService: ClientSchemaElementWorkspaceService,
    private clientSchemaElementActionsService: ClientSchemaElementActionsService,
    private clientSchemaElementService: ClientSchemaElementService,
    private clientParcelElementWorkspaceService: ClientParcelElementWorkspaceService,
    private clientParcelElementActionsService: ClientParcelElementActionsService,
    private clientSchemaElementTransactionService: ClientSchemaElementTransactionService
  ) {}

  createClientController(client: Client, options: Partial<ClientControllerOptions> = {}): ClientController {
    const map = this.mapState.map;
    const parcelWorkspace = this.clientParcelWorkspaceService.createParcelWorkspace(client, map);
    const schemaWorkspace = this.clientSchemaWorkspaceService.createSchemaWorkspace(client);
    const schemaElementWorkspace = this.clientSchemaElementWorkspaceService.createSchemaElementWorkspace(client, map);
    const schemaElementService = this.clientSchemaElementService;
    const parcelElementWorkspace = this.clientParcelElementWorkspaceService.createParcelElementWorkspace(client, map);
    const schemaElementTransactionService = this.clientSchemaElementTransactionService;

    const controller = new ClientController({
      map,
      workspaceStore: options.workspaceStore,
      client,
      parcelWorkspace,
      schemaWorkspace,
      schemaElementWorkspace,
      schemaElementService,
      parcelElementWorkspace,
      schemaElementTransactionService,
      // moveToParcels: options.moveToParcels
    });

    const parcelActions = this.clientParcelActionsService.buildActions(controller);
    parcelWorkspace.actionStore.load(parcelActions);

    const schemaActions = this.clientSchemaActionsService.buildActions(controller);
    schemaWorkspace.actionStore.load(schemaActions);

    const schemaElementActions = this.clientSchemaElementActionsService.buildActions(controller);
    schemaElementWorkspace.actionStore.load(schemaElementActions);

    const parcelElementActions = this.clientParcelElementActionsService.buildActions(controller);
    parcelElementWorkspace.actionStore.load(parcelElementActions);

    return controller;
  }

}
