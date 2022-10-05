import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/lib/core/api';

import { Client } from '../../shared/client.interfaces';
import { padClientNum } from '../../shared/client.utils';
import {
  ClientParcel,
  ClientParcelApiConfig,
  ClientParcelListResponse,
  ClientParcelListResponseItem
} from './client-parcel.interfaces';
import { sortParcelsByRelation } from './client-parcel.utils';

@Injectable()
export class ClientParcelService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('clientParcelApiConfig') private apiConfig: ClientParcelApiConfig
  ) {}

  getParcels(client: Client, annee: number): Observable<ClientParcel[]> {
    const url = this.apiService.buildUrl(this.apiConfig.list, {
      clientNum: client.info.numero,
      annee
    });

    return this.http
      .get(url)
      .pipe(
        map((response: ClientParcelListResponse) => {
          return this.extractParcelsFromListResponse(response, client);
        })
      );
  }

  private extractParcelsFromListResponse(
    response: ClientParcelListResponse,
    client: Client
  ): ClientParcel[] {
    return response
      .map(listItem => this.listItemToParcel(listItem, client))
      .sort(sortParcelsByRelation);
  }

  private listItemToParcel(
    listItem: ClientParcelListResponseItem,
    client: Client
  ): ClientParcel {
    const noClientRecherche = padClientNum(client.info.numero);
    const properties = Object.assign({}, listItem.properties, {
      noClientRecherche
    });
    return {
      meta: {
        id: listItem.properties.id,
        mapTitle: listItem.properties.noParcelleAgricole
      },
      type: listItem.type,
      projection: 'EPSG:4326',
      geometry: listItem.geometry,
      extent: undefined,
      properties
    };
  }
}
