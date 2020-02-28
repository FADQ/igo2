import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/lib/core/api';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelTxState } from './client-parcel-tx.enums';
import {
  ClientInReconciliationResponse,
  ClientInReconciliationResponseData,
  ClientParcelTxApiConfig,
  ClientParcelTxActivateResponse,
  ClientInParcelTx,
  ClientsInParcelTxGetResponse
} from './client-parcel-tx.interfaces';

@Injectable()
export class ClientParcelTxService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('clientParcelTxApiConfig') private apiConfig: ClientParcelTxApiConfig
  ) {}

  getClientsInTx(): Observable<Client[]> {
    const url = this.apiService.buildUrl(this.apiConfig.clients);
    return this.http.get(url)
      .pipe(
        map((response: ClientsInParcelTxGetResponse) => {
          return this.extractClientsFromClientsInTxResponse(response);
        })
      );
  }

  getParcelTxState(client: Client, annee: number): Observable<ClientParcelTxState> {
    const url = this.apiService.buildUrl(this.apiConfig.start, {
      clientNum: client.info.numero,
      annee
    });
    return this.http.get(url)
      .pipe(
        map((response: ClientParcelTxActivateResponse) => {
          return response.data.resultat;
        })
      );
  }

  prepareParcelTx(client: Client, annee: number): Observable<any> {
    const url = this.apiService.buildUrl(this.apiConfig.create, {
      clientNum: client.info.numero,
      annee
    });
    return this.http.get(url);
  }

  deleteParcelTx(client: Client, annee: number): Observable<any> {
    const url = this.apiService.buildUrl(this.apiConfig.delete, {
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

  private extractClientsFromClientsInTxResponse(response: ClientsInParcelTxGetResponse): Client[] {
    return response.data.map((item: ClientInParcelTx) => ({
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
