import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { ClientInfo, ClientInfoService } from '../info';

import { Client, ClientRef } from './client.interfaces';

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
         return  this.resultsToClient(results);
        })
      );
  }

  getClients(): Observable<ClientRef[]> {
    return zip(
      this.infoService.getClientInfoByNum('1560'),
      this.infoService.getClientInfoByNum('7229')
    ).pipe(
      map((results: [ClientInfo, ClientInfo]) => {
        return results.map((result: ClientInfo) => this.resultsToClient([result]));
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
