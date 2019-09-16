import { Injectable} from '@angular/core';

import { MapState } from '@igo2/integration';

import {
  Client,
  ClientControllerOptions,
  ClientParcelService
} from 'src/lib/client';

import { ClientController } from './client-controller';
import { ClientParcelWorkspaceService } from './client-parcel-workspace.service';
import { ClientParcelActionsService } from './client-parcel-actions.service';

@Injectable({
  providedIn: 'root'
})
export class ClientControllerService {

  constructor(
    private mapState: MapState,
    private clientParcelService: ClientParcelService,
    private clientParcelWorkspaceService: ClientParcelWorkspaceService,
    private clientParcelActionsService: ClientParcelActionsService
  ) {}

  createClientController(client: Client, options: Partial<ClientControllerOptions> = {}): ClientController {
    const map = this.mapState.map;
    const parcelService = this.clientParcelService;
    const parcelWorkspace = this.clientParcelWorkspaceService.createParcelWorkspace(client, map);
    const parcelYear = options.parcelYear;

    const controller = new ClientController({
      map,
      client,
      parcelYear,
      parcelService,
      parcelWorkspace
    });

    const parcelActions = this.clientParcelActionsService.buildActions(controller);
    parcelWorkspace.actionStore.load(parcelActions);

    return controller;
  }

}
