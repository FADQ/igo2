import { Injectable} from '@angular/core';

import { LanguageService } from '@igo2/core';
import { MapState } from '@igo2/integration';

import {
  Client,
  ClientParcelService
} from 'src/lib/client';

import {
  ClientController,
  ClientControllerOptions
} from './client-controller';
import { ClientParcelWorkspaceService } from './client-parcel-workspace.service';
import { ClientParcelActionsService } from './client-parcel-actions.service';

/**
 * This is a client controller factory
 */
@Injectable({
  providedIn: 'root'
})
export class ClientControllerService {

  constructor(
    private mapState: MapState,
    private clientParcelService: ClientParcelService,
    private clientParcelWorkspaceService: ClientParcelWorkspaceService,
    private clientParcelActionsService: ClientParcelActionsService,
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
    const parcelYear = options.parcelYear;
    const languageService = this.languageService;

    const controller = new ClientController({
      map,
      client,
      parcelYear,
      parcelService,
      parcelWorkspace,
      languageService
    });

    this.clientParcelActionsService.loadActions(controller);

    return controller;
  }

}
