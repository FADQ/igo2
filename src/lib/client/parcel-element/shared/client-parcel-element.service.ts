import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { concatMap, map, catchError } from 'rxjs/operators';

import { EntityOperation, EntityTransaction } from '@igo2/common';

import { ApiService } from 'src/lib/core/api';
import { TransactionSerializer, TransactionData } from 'src/lib/utils/transaction';

import { computeParcelElementArea, transactionDataToSaveParcelElementData } from './client-parcel-element.utils';
import { Client } from '../../shared/client.interfaces';
import { ClientParcelElementEditionState } from './client-parcel-element.enums';
import {
  ClientInReconciliationResponse,
  ClientInReconciliationResponseData,
  ClientParcelElement,
  ClientParcelElementApiConfig,
  ClientParcelElementListResponse,
  ClientParcelElementListResponseItem,
  ClientParcelElementActivateEditionResponse,
  ClientParcelElementValidateTransferResponse
} from './client-parcel-element.interfaces';

@Injectable()
export class ClientParcelElementService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('clientParcelApiConfig') private apiConfig: ClientParcelElementApiConfig
  ) {}

  getParcelEditionState(client: Client, annee: number): Observable<ClientParcelElementEditionState> {
    const url = this.apiService.buildUrl(this.apiConfig.activateEdition, {
      clientNum: client.info.numero,
      annee: annee
    });
    return this.http.get(url)
      .pipe(
        map((response: ClientParcelElementActivateEditionResponse) => {
          return response.data.resultat;
        })
      );
  }

  prepareParcelEdition(client: Client, annee: number): Observable<any> {
    const url = this.apiService.buildUrl(this.apiConfig.createEditionSchema, {
      clientNum: client.info.numero,
      annee: annee
    });
    return this.http.get(url);
  }

  getParcelElements(client: Client, annee: number): Observable<ClientParcelElement[]> {
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

  getClientsInReconcilitation(client: Client): Observable<Client[]> {
    const url = this.apiService.buildUrl(this.apiConfig.reconciliateClients, {
      clientNum: client.info.numero
    });

    return this.http.get(url).pipe(
      map((response: ClientInReconciliationResponse) => {
        return response.data.map((data: ClientInReconciliationResponseData) => {
          return {
            info: {
              nom: data.nomClient,
              numero: data.numeroClient,
              adresseCor: undefined,
              adresseExp: undefined,
              adressePro: []
            }
          };
        });
      })
    );
  }

  reconciliate(client: Client, annee: number): Observable<any> {
    const url = this.apiService.buildUrl(this.apiConfig.reconciliate, {
      clientNum: client.info.numero,
      annee
    });

    return this.http.get(url);
  }

  validateTransfer(toClient: Client, annee: number): Observable<boolean> {
    const url = this.apiService.buildUrl(this.apiConfig.validateTransfer, {
      toClientNum: toClient.info.numero,
      annee
    });

    return this.http.get(url).pipe(
      map((response: ClientParcelElementValidateTransferResponse) => response.data.transfertPossible)
    );
  }

  transfer(
    fromClient: Client,
    toClient: Client,
    annee: number,
    parcelElementIds: number[],
    keepParcelNumbers: boolean
  ): Observable<unknown> {
    const url = this.apiService.buildUrl(this.apiConfig.transfer, {
      fromClientNum: fromClient.info.numero,
      toClientNum: toClient.info.numero,
      annee
    });

    return this.http.post(url, {
      lstIdParcelles: parcelElementIds,
      indiConserverNoParcelle: keepParcelNumbers
    });
  }

  /**
   * Create a parcel element from partial data, withtout saving it
   * @param parcel Parcel of the element
   * @param data Parcel element data
   * @returns Observable of the parcel element
   */
  createParcelElement(data: Partial<ClientParcelElement>): Observable<ClientParcelElement> {
    const properties = Object.assign(
      {
        noDiagramme: 9999
      },
      data.properties,
      {
        typeParcelle: 'PAC',
        messages: []
      }
    );
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
    annee: number,
    transaction: EntityTransaction
  ): Observable<ClientParcelElement[] | Error> {
    const operations = transaction.operations.all();
    return transaction.commit(operations, (tx: EntityTransaction, ops: EntityOperation[]) => {
      return this.commitOperations(client, annee, ops);
    });
  }

  /**
   * Commit (save) some operations of a transaction
   * @param operations Transaction operations
   * @param geometryType The geometry type of the data we're saving
   * @returns Observable of the all the elements of that by geometry type or of an error object
   */
  private commitOperations(
    client: Client,
    annee: number,
    operations: EntityOperation[]
  ): Observable<ClientParcelElement[] | Error> {
    const serializer = new TransactionSerializer<ClientParcelElement>();
    const data = serializer.serializeOperations(operations);
    return this.saveElements(client, annee, data);
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
    annee: number,
    data: TransactionData<ClientParcelElement>
  ): Observable<ClientParcelElement[] | Error> {
    const url = this.apiService.buildUrl(this.apiConfig.save, {
      clientNum: client.info.numero,
      annee: annee
    });
    return this.http.post(url, transactionDataToSaveParcelElementData(data))
      .pipe(
        catchError(() => of(new Error())),
        concatMap((response: any) => {
          if (response instanceof Error) {
            return of(response);
          }
          return this.getParcelElements(client, annee);
        })
      );
  }

  private extractParcelsFromListResponse(
    response: ClientParcelElementListResponse,
    client: Client
  ): ClientParcelElement[] {
    return response.data.map(listItem => this.listItemToParcel(listItem, client));
  }

  private listItemToParcel(
    listItem: ClientParcelElementListResponseItem,
    client: Client
  ): ClientParcelElement {
    const properties = Object.assign({}, listItem.properties);
    return {
      meta: {
        id: listItem.properties.idParcelle,
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
