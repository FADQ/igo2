import { Injectable } from '@angular/core';
import { Observable, zip, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ClientInfo, ClientInfoService } from '../info';
import { ClientParcel, ClientParcelService, getDiagramsFromParcels } from '../parcel';
import { ClientSchema, ClientSchemaService } from '../schema';

import { Client, ClientRef } from './client.interfaces';

@Injectable()
export class ClientService {

  constructor(
    private infoService: ClientInfoService,
    private parcelService: ClientParcelService,
    private schemaService: ClientSchemaService
  ) {}

  getClientByNum(clientNum: string, annee: number = 2018): Observable<Client> {
    const client$ = zip(
      this.infoService.getClientInfoByNum(clientNum),
      this.schemaService.getClientSchemasByNum(clientNum),
      this.parcelService.getClientParcelsByNum(clientNum, annee)
    );

    return client$
      .pipe(
        map((results: [ClientInfo, ClientSchema[], ClientParcel[]]) => {
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
        console.log(results);
        return results.map((result: ClientInfo) => this.resultsToClient([result, [], []]));
      })
    );
  }

  private resultsToClient(
    results: [ClientInfo, ClientSchema[], ClientParcel[]]
  ): Client | undefined {
    const [info, schemas, parcels] = results;
    if (info === undefined) {
      return undefined;
    }

    return Object.assign({meta: {idProperty: 'numero'}}, {
      info: info,
      schemas: schemas,
      parcels: parcels,
      diagrams: getDiagramsFromParcels(parcels)
    });
  }
}
