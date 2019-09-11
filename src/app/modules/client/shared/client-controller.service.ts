import { Injectable} from '@angular/core';

import { MapState } from '@igo2/integration';

import { hexToRGB } from 'src/lib/utils/color';

import {
  Client,
  ClientController,
  ClientControllerOptions,
  ClientParcelService,
  ClientParcelElementService,
  ClientParcelElementTransactionService,
  ClientSchemaService,
  ClientSchemaElementService,
  ClientSchemaElementTransactionService
} from 'src/lib/client';

import { ClientParcelWorkspaceService } from './client-parcel-workspace.service';
import { ClientParcelActionsService } from './client-parcel-actions.service';
import { ClientParcelElementWorkspaceService } from './client-parcel-element-workspace.service';
import { ClientParcelElementActionsService } from './client-parcel-element-actions.service';
import { ClientSchemaWorkspaceService } from './client-schema-workspace.service';
import { ClientSchemaActionsService } from './client-schema-actions.service';
import { ClientSchemaElementWorkspaceService } from './client-schema-element-workspace.service';
import { ClientSchemaElementActionsService } from './client-schema-element-actions.service';

@Injectable({
  providedIn: 'root'
})
export class ClientControllerService {

  static colors: string[] = [
    '8e24aa',
    'ffeb3b',
    '00bcd4',
    'd81b60',
    'ff8f00'
  ];

  private colorPalette: Iterator<[number, number, number]>;

  constructor(
    private mapState: MapState,
    private clientParcelService: ClientParcelService,
    private clientParcelWorkspaceService: ClientParcelWorkspaceService,
    private clientParcelActionsService: ClientParcelActionsService,
    private clientParcelElementService: ClientParcelElementService,
    private clientParcelElementTransactionService: ClientParcelElementTransactionService,
    private clientParcelElementWorkspaceService: ClientParcelElementWorkspaceService,
    private clientParcelElementActionsService: ClientParcelElementActionsService,
    private clientSchemaService: ClientSchemaService,
    private clientSchemaWorkspaceService: ClientSchemaWorkspaceService,
    private clientSchemaActionsService: ClientSchemaActionsService,
    private clientSchemaElementService: ClientSchemaElementService,
    private clientSchemaElementTransactionService: ClientSchemaElementTransactionService,
    private clientSchemaElementWorkspaceService: ClientSchemaElementWorkspaceService,
    private clientSchemaElementActionsService: ClientSchemaElementActionsService
  ) {}

  createClientController(client: Client, options: Partial<ClientControllerOptions> = {}): ClientController {
    const map = this.mapState.map;
    const parcelService = this.clientParcelService;
    const parcelWorkspace = this.clientParcelWorkspaceService.createParcelWorkspace(client, map);
    const parcelElementTransactionService = this.clientParcelElementTransactionService;
    const schemaService = this.clientSchemaService;
    const schemaWorkspace = this.clientSchemaWorkspaceService.createSchemaWorkspace(client);
    const schemaElementWorkspace = this.clientSchemaElementWorkspaceService.createSchemaElementWorkspace(client, map);
    const parcelElementService = this.clientParcelElementService;
    const parcelElementWorkspace = this.clientParcelElementWorkspaceService.createParcelElementWorkspace(client, map);
    const schemaElementService = this.clientSchemaElementService;
    const schemaElementTransactionService = this.clientSchemaElementTransactionService;

    if (this.colorPalette === undefined || options.controllers.count === 0) {
      this.colorPalette = this.createColorIterator();
    }

    const controller = new ClientController({
      map,
      workspaceStore: options.workspaceStore,
      client,
      parcelYear: options.parcelYear,
      parcelService,
      parcelWorkspace,
      parcelElementTransactionService,
      schemaService,
      schemaWorkspace,
      schemaElementWorkspace,
      parcelElementService,
      parcelElementWorkspace,
      schemaElementService,
      schemaElementTransactionService,
      controllers: options.controllers,
      color: this.colorPalette.next().value
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

  *createColorIterator(): Iterator<[number, number, number]> {
    let index = 0;
    let hex: string;

    while (true) {
      if (index < ClientControllerService.colors.length) {
        hex = ClientControllerService.colors[index];
      } else {
        hex = '' + Math.floor(Math.random() * 16777215).toString(16);
      }

      yield hexToRGB(hex);

      index += 1;
    }

  }

}
