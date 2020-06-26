import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import {
  ClientService
} from 'src/lib/client';

/**
 * Client loader that loads a client from the URL.
 */
@Injectable({
  providedIn: 'root'
})
export class URLClientLoader {

  constructor(
    private activatedRoute: ActivatedRoute,
    private clientService: ClientService
  ) {}

  /**
   * Load the client from the URL.
   */
  loadClient() {
    return this.activatedRoute.queryParams
      .pipe(
        concatMap((params: {[key: string]: string}) => {
          const cliNum = params['clinum'];
          if (cliNum) {
            return this.clientService.getClientByNum(cliNum);
          }
          return of(undefined);
        })
    );
  }

}
