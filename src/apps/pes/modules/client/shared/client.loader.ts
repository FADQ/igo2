import { Injectable } from '@angular/core';

import {
  ClientService
} from 'src/lib/client';

/**
 * Client loader that loads a client from the URL.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientLoader {

  constructor(
    private clientService: ClientService
  ) {}

  /**
   * Load the client from the URL.
   */
  loadClient() {
    return this.clientService.getClientByNum('');
  }

}
