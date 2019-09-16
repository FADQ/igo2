import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/lib/core/api';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElementTxState } from './client-parcel-element.enums';
import {
  ClientInReconciliationResponse,
  ClientInReconciliationResponseData,
  ClientParcelElementApiConfig,
  ClientParcelElementActivateTxResponse,
  ClientInTx,
  ClientsInTxGetResponse
} from './client-parcel-element.interfaces';

@Injectable()
export class ClientParcelElementTxService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('clientParcelElementApiConfig') private apiConfig: ClientParcelElementApiConfig
  ) {}

  getClientsInTx(): Observable<Client[]> {
    const url = this.apiService.buildUrl(this.apiConfig.clientsInTx);
    return this.http.get(url)
      .pipe(
        map((response: ClientsInTxGetResponse) => {
          return this.extractClientsFromClientsInTxResponse(response);
        })
      );
  }

  getParcelTxState(client: Client, annee: number): Observable<ClientParcelElementTxState> {
    const url = this.apiService.buildUrl(this.apiConfig.startTx, {
      clientNum: client.info.numero,
      annee
    });
    return this.http.get(url)
      .pipe(
        map((response: ClientParcelElementActivateTxResponse) => {
          return response.data.resultat;
        })
      );
  }

  prepareParcelTx(client: Client, annee: number): Observable<any> {
    const url = this.apiService.buildUrl(this.apiConfig.createTx, {
      clientNum: client.info.numero,
      annee
    });
    return this.http.get(url);
  }

  deleteParcelTx(client: Client, annee: number): Observable<any> {
    const url = this.apiService.buildUrl(this.apiConfig.deleteTx, {
      clientNum: client.info.numero,
      annee
    });
    return this.http.get(url);
  }

  getClientsInReconcilitation(client: Client): Observable<Client[]> {
    const url = this.apiService.buildUrl(this.apiConfig.reconciliateClients, {
      clientNum: client.info.numero
    });

    return this.http.get(url).pipe(
      map((response: ClientInReconciliationResponse) => {
        return response.data.map((item: ClientInReconciliationResponseData) => {
          return {
            info: {
              nom: item.nomClient,
              numero: item.numeroClient,
              adresseCor: undefined,
              adresseExp: undefined,
              adressePro: []
            }
          };
        });
      })
    );
  }

  reconciliate(client: Client, annee: number): Observable<unknown> {
    const url = this.apiService.buildUrl(this.apiConfig.reconciliate, {
      clientNum: client.info.numero,
      annee
    });

    return this.http.get(url);
  }

  private extractClientsFromClientsInTxResponse(response: ClientsInTxGetResponse): Client[] {
    return response.data.map((item: ClientInTx) => ({
      info: {
        numero: item.noClient,
        nom: item.nomClient,
        adresseCor: undefined,
        adresseExp: undefined,
        adressePro: []
      },
      tx: {
        date: item.dateCreation.date,
        annee: item.annee
      }
    }));
  }
}
