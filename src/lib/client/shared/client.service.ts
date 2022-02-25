import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { ClientInfo, ClientInfoService } from '../info';

import { Client } from './client.interfaces';

@Injectable()
export class ClientService {

  constructor(
    private infoService: ClientInfoService
  ) {}

  getClientByNum(clientNum: string): Observable<Client> {
    const client$ = zip(
      this.infoService.getClientInfoByNum(clientNum)
    );

    return client$
      .pipe(
        map((results: [ClientInfo]) => {
         return this.resultsToClient(results);
        })
      );
  }

  private resultsToClient(
    results: [ClientInfo]
  ): Client | undefined {
    const [info] = results;
    if (info === undefined) {
      return undefined;
    }

    return Object.assign({meta: {idProperty: 'numero'}}, {
      info: info,

    });
  }
}
