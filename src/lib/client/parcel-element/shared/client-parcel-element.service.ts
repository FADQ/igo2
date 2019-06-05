import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntityOperation, EntityTransaction } from '@igo2/common';

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
   * @param schema Parcel
   * @param transaction Transaction shared by all geometry types
   * @returns Observable of the all the elements by geometry type or of an error object
   */
  commitTransaction(
    transaction: EntityTransaction
  ): Observable<ClientParcelElement[] | Error> {
    const commits$ = ['Polygon'].map((type: string) => {
      const operations = transaction.operations.all().filter((operation: EntityOperation) => {
        const element = (operation.current || operation.previous) as ClientParcelElement;
        return element.geometry.type === type;
      });

      return transaction.commit(operations, (tx: EntityTransaction, ops: EntityOperation[]) => {
        return this.commitOperationsOfType(ops, type);
      });
    });

    return zip(...commits$);
  }

  /**
   * Commit (save) some operations of a transaction
   * @param schema Parcel
   * @param operations Transaction operations
   * @param geometryType The geometry type of the data we're saving
   * @returns Observable of the all the elements of that by geometry type or of an error object
   */
  private commitOperationsOfType(
    operations: EntityOperation[],
    geometryType: string
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
