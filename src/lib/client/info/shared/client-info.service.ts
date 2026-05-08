import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/lib/core/api';
import { substituteProperties } from 'src/lib/utils';

import {
  ClientInfo,
  ClientInfoAddresses,
  ClientInfoApiConfig,
  ClientInfoGetResponse,
  ClientInfoAddressesResponse,
  ClientInfoAddressData
} from './client-info.interfaces';

@Injectable()
export class ClientInfoService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('clientInfoApiConfig') private apiConfig: ClientInfoApiConfig
  ) {}

  getClientInfoByNum(clientNum: string): Observable<ClientInfo | undefined> {
    const url = this.apiService.buildUrl(this.apiConfig.get, { clientNum });

    const clientBaseInfo$ = this.http
      .get<ClientInfoGetResponse>(url)
      .pipe(
        map(response => this.extractClientInfoFromGetResponse(response))
      );

    const clientAddresses$ = this.getClientAddressesByNum(clientNum);

    return forkJoin({
      base: clientBaseInfo$,
      addresses: clientAddresses$
    }).pipe(
      map(({ base, addresses }) => {
        if (!base) {
          return undefined;
        }

        return {
          ...base,
          ...addresses
        };
      })
    );
  }

  private getClientAddressesByNum(clientNum: string): Observable<ClientInfoAddresses> {
    const url = this.apiService.buildUrl(this.apiConfig.addresses, { clientNum });

    return this.http
      .get<ClientInfoAddressesResponse>(url)
      .pipe(
        map(response => this.extractClientAddressesFromResponse(response))
      );
  }

  getClientInfoLink(clientNum: string): string {
    return substituteProperties(this.apiConfig.link, { clientNum });
  }

  private extractClientInfoFromGetResponse(response: ClientInfoGetResponse): ClientInfo | undefined {
    const data = response.data;
    if (data === null) {
      return undefined;
    }

    return {
      numero: data.numeroClient,
      nom: data.nomClient,
      adresseCor: undefined,
      adresseExp: undefined,
      adressePro: []
    };
  }

  private extractClientAddressesFromResponse(response: ClientInfoAddressesResponse): ClientInfoAddresses {
    const data = response.data;

    return {
      adresseCor: this.extractAddressFromGetResponseData(
        data.find(a => a.typeAdresse === 'COR')
      ),
      adresseExp: this.extractAddressFromGetResponseData(
        data.find(a => a.typeAdresse === 'EXP')
      ),
      adressePro: data
        .filter(a => a.typeAdresse === 'SPR')
        .map(a => this.extractAddressFromGetResponseData(a))
    };
  }

  private extractAddressFromGetResponseData(data: ClientInfoAddressData) {
    if (!data) return undefined;

    const address = data.adresse;
    const mun = data.municipaliteAdresse;
    const code = data.codePostalAdresse;
    const province = data.provincePaysAdresse;

    return [address, mun, code, `(${province})`]
      .filter(Boolean)
      .join(' ');
  }
}
