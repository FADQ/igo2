import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { ApiService } from 'src/lib/core/api';

import {
  ClientParcelPro,
  ClientParcelProApiConfig
} from './client-parcel-pro.interfaces';

@Injectable()
export class ClientParcelProService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('clientParcelProApiConfig') private apiConfig: ClientParcelProApiConfig
  ) {}

  /**
   * Create a parcel pro from partial data, withtout saving it
   * @param parcel Parcel of the pro
   * @param data Parcel pro data
   * @returns Observable of the parcel pro
   */
  createParcelPro(data: Partial<ClientParcelPro>): Observable<ClientParcelPro> {
    if (data.geometry === undefined || data.geometry.type !== 'Polygon') {
      return of(undefined);
    }

    const properties = Object.assign(
      data.properties,
      {
      }
    );
    const parcelPro = Object.assign({}, data, {properties}) as ClientParcelPro;
    return of(parcelPro);
  }

}
