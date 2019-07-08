import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, zip } from 'rxjs';
import { concatMap, map, catchError } from 'rxjs/operators';

import { EntityOperation, EntityTransaction } from '@igo2/common';

import { ApiService } from 'src/lib/core/api';
import { TransactionSerializer, TransactionData } from 'src/lib/utils/transaction';

import { computeParcelElementArea } from './client-parcel-element.utils';
import { Client } from '../../shared/client.interfaces';
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

  canStartParcelEdition(client: Client): Observable<boolean> {
    return of(false);
    // const url = this.apiService.buildUrl(this.apiConfig.startEdition, {
    //   cliNum: client.info.numero
    // });
    // return this.http.post(url, data);
  }

  getParcelElements(client: Client, annee: number = 2018): Observable<ClientParcelElement[]> {
    return zip(
      this.buildGetParcelElementsRequest(client, annee),
      this.buildValidateParcelElementsRequest(client)
    ).pipe(
      map((bunch: [ClientParcelElement[], {[key: string]: string[]}]) => {
        const [parcelElements, errors] = bunch;
        return parcelElements.map((parcelElement: ClientParcelElement) => {
          const parcelElementErrors = errors[parcelElement.properties.noParcelleAgricole];
          const meta = Object.assign({}, parcelElement.meta, {errors: parcelElementErrors});
          return Object.assign({}, parcelElement, {meta});
        });
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
    parcelElement.properties.superficie = computeParcelElementArea(parcelElement);
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
    client: Client,
    transaction: EntityTransaction
  ): Observable<ClientParcelElement[] | Error> {
    const operations = transaction.operations.all();
    return transaction.commit(operations, (tx: EntityTransaction, ops: EntityOperation[]) => {
      return this.commitOperations(client, ops);
    });
  }

  private buildGetParcelElementsRequest(client: Client, annee: number): Observable<ClientParcelElement[]> {
    const url = this.apiService.buildUrl(this.apiConfig.list, {
      clientNum: client.info.numero,
      annee
    });

    return this.http
      .get(url)
      .pipe(
        map((response: ClientParcelElementListResponse) => {
          return this.extractParcelsFromListResponse(response, client);
        })
      );
  }

  private buildSaveParcelElementsRequest(client: Client, data: TransactionData<ClientParcelElement>): Observable<any> {
    return of({});
    // const url = this.apiService.buildUrl(this.apiConfig.save, {
    //   cliNum: client.info.numero
    // });
    // return this.http.post(url, data);
  }

  private buildValidateParcelElementsRequest(client: Client): Observable<{[key: string]: string[]}> {
    const errors = client.parcels.reduce((acc: any, parcel: any) => {
      acc[parcel.properties.noParcelleAgricole] = ['Invalide'];
      return acc;
    }, {});
    return of(errors);
    // const url = this.apiService.buildUrl(this.apiConfig.validate, {
    //   cliNum: client.info.numero
    // });
    // return this.http.post(url, data);
  }

  /**
   * Commit (save) some operations of a transaction
   * @param operations Transaction operations
   * @param geometryType The geometry type of the data we're saving
   * @returns Observable of the all the elements of that by geometry type or of an error object
   */
  private commitOperations(
    client: Client,
    operations: EntityOperation[]
  ): Observable<ClientParcelElement[] | Error> {
    const serializer = new TransactionSerializer<ClientParcelElement>();
    const data = serializer.serializeOperations(operations);
    return this.saveElements(client, data);
  }

  /**
   * Save the elements of a geometry type then fetch all the elements of the type.
   * @param schema Schema
   * @param data Data to save
   * @param geometryType The geometry type of the data we're saving
   * @returns Observable of the all the elements of that by geometry type or of an error object
   */
  private saveElements(
    client: Client,
    data: TransactionData<ClientParcelElement>
  ): Observable<ClientParcelElement[] | Error> {
    return this.buildSaveParcelElementsRequest(client, data)
      .pipe(
        catchError(() => of(new Error())),
        concatMap((response: any) => {
          if (response instanceof Error) {
            return of(response);
          } else {
            return this.getParcelElements(client);
          }
        })
      );
  }

  private extractParcelsFromListResponse(
    response: ClientParcelElementListResponse,
    client: Client
  ): ClientParcelElement[] {
    return response
      .map(listItem => this.listItemToParcel(listItem, client));
  }

  private listItemToParcel(
    listItem: ClientParcelElementListResponseItem,
    client: Client
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
