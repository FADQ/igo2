import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntityTransaction } from '@igo2/common';

import { ApiService } from 'src/lib/core/api';
import {
  ClientParcelElement,
  ClientParcelElementApiConfig,
  ClientParcelElementListResponse,
  ClientParcelElementListResponseItem
} from './client-parcel-element.interfaces';

@Injectable()
export class ClientParcelElementService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('clientParcelApiConfig') private apiConfig: ClientParcelElementApiConfig
  ) {}

  getClientParcelElementsByNum(clientNum: string, annee: number = 2018): Observable<ClientParcelElement[]> {
    const url = this.apiService.buildUrl(this.apiConfig.list, {
      clientNum,
      annee
    });

    return this.http
      .get(url)
      .pipe(
        map((response: ClientParcelElementListResponse) => {
          return this.extractParcelsFromListResponse(response, clientNum);
        })
      );
  }

  /**
   * Create a parcel element from partial data, withtout saving it
   * @param parcel Parcel of the element
   * @param data Parcel element data
   * @returns Observable of the parcel element
   */
  createParcelElement(data: Partial<ClientParcelElement>): Observable<ClientParcelElement> {
    const properties = Object.assign({}, data.properties);
    const parcelElement = Object.assign({}, data, {properties}) as ClientParcelElement;
    return of(parcelElement);
  }

  /**
   * Commit (save) a whole transaction  containig points, lines and polygons. Each of those geometry type
   * has it's own endpoint so we're making 3 requests. On a success, elements of the same geometry
   * type are fetched and returned
   * @param transaction Transaction shared by all geometry types
   * @returns Observable of the all the elements by geometry type or of an error object
   */
  commitTransaction(
    transaction: EntityTransaction
  ): Observable<ClientParcelElement[] | Error> {
    return of([]);
  }

  private extractParcelsFromListResponse(
    response: ClientParcelElementListResponse,
    clientNum: string
  ): ClientParcelElement[] {
    return response
      .map(listItem => this.listItemToParcel(listItem, clientNum));
  }

  private listItemToParcel(
    listItem: ClientParcelElementListResponseItem,
    clientNum: string
  ): ClientParcelElement {
    const properties = Object.assign({}, listItem.properties);
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
