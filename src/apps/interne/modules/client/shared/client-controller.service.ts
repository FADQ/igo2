import { Injectable} from '@angular/core';

import { LanguageService } from '@igo2/core';
import { MapState } from '@igo2/integration';

import { hexToRGB } from 'src/lib/utils/color';

import {
  Client,
  ClientParcelColors,
  ClientParcelService,
  ClientParcelElementService,
  ClientParcelElementTransactionService,
  ClientSchemaService,
  ClientSchemaElementService,
  ClientSchemaElementTransactionService
} from 'src/lib/client';

import {
  ClientController,
  ClientControllerOptions
} from './client-controller';
import { ClientParcelWorkspaceService } from './client-parcel-workspace.service';
import { ClientParcelActionsService } from './client-parcel-actions.service';
import { ClientParcelElementWorkspaceService } from './client-parcel-element-workspace.service';
import { ClientParcelElementActionsService } from './client-parcel-element-actions.service';
import { ClientSchemaWorkspaceService } from './client-schema-workspace.service';
import { ClientSchemaActionsService } from './client-schema-actions.service';
import { ClientSchemaElementWorkspaceService } from './client-schema-element-workspace.service';
import { ClientSchemaElementActionsService } from './client-schema-element-actions.service';

/**
 * This is a client controller factory
 */
@Injectable({
  providedIn: 'root'
})
export class ClientControllerService {

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
    private clientSchemaElementActionsService: ClientSchemaElementActionsService,
    private languageService: LanguageService
  ) {}

  /**
   * Create a controller for a client
   * @param client Client
   * @param options Controller options
   * @returns Client controller
   */
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
    const languageService = this.languageService;

    // When all clients are cleared, reset the color palette.
    // That means, color may be reused again.
    if (this.colorPalette === undefined || options.controllers.count === 0) {
      this.colorPalette = this.createColorIterator();
    }

    const controller = new ClientController({
      map,
      workspaces: options.workspaces,
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
      color: this.colorPalette.next().value,
      languageService
    });

    this.clientParcelActionsService.loadActions(controller);
    this.clientSchemaActionsService.loadActions(controller);
    this.clientSchemaElementActionsService.loadActions(controller);
    this.clientParcelElementActionsService.loadActions(controller);

    return controller;
  }

  /**
   * Create a color iterator. A color from the color palette
   * may be used only once. See the comment above.
   * If more colors are needed, a random one is generated
   * @returns RGB color iterator
   */
  *createColorIterator(): Iterator<[number, number, number]> {
    let index = 0;
    let rgb: [number, number, number];
    const colors = ClientParcelColors;

    while (true) {
      if (index < colors.length) {
        rgb = colors[index];
      } else {
        const hex = '' + Math.floor(Math.random() * 16777215).toString(16);
        rgb = hexToRGB(hex);
      }

      yield rgb;

      index += 1;
    }

  }

}
