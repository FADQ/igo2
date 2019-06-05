import { Injectable} from '@angular/core';

import { MapState } from '@igo2/integration';

import {
  Client,
  ClientController,
  ClientControllerOptions,
  ClientSchemaElementTransactionService
} from 'src/lib/client';

import {
  ClientParcelWorkspaceService,
  ClientParcelActionsService,
  ClientParcelElementTransactionService,
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
    private clientSchemaElementTransactionService: ClientSchemaElementTransactionService,
    private clientSchemaElementWorkspaceService: ClientSchemaElementWorkspaceService,
    private clientSchemaElementActionsService: ClientSchemaElementActionsService,
    private clientParcelElementTransactionService: ClientParcelElementTransactionService,
    private clientParcelElementWorkspaceService: ClientParcelElementWorkspaceService,
    private clientParcelElementActionsService: ClientParcelElementActionsService,
  ) {}

  createClientController(client: Client, options: Partial<ClientControllerOptions> = {}): ClientController {
    const map = this.mapState.map;
    const parcelWorkspace = this.clientParcelWorkspaceService.createParcelWorkspace(client, map);
    const parcelElementTransactionService = this.clientParcelElementTransactionService;
    const schemaWorkspace = this.clientSchemaWorkspaceService.createSchemaWorkspace(client);
    const schemaElementWorkspace = this.clientSchemaElementWorkspaceService.createSchemaElementWorkspace(client, map);
    const parcelElementWorkspace = this.clientParcelElementWorkspaceService.createParcelElementWorkspace(client, map);
    const schemaElementTransactionService = this.clientSchemaElementTransactionService;

    const controller = new ClientController({
      map,
      workspaceStore: options.workspaceStore,
      client,
      parcelWorkspace,
      parcelElementTransactionService,
      schemaWorkspace,
      schemaElementWorkspace,
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
