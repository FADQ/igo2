import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/lib/core/api';
import {
  Mun,
  MunNom,
  MunApiConfig,
  MunNomListResponse,
} from 'src/lib/cadastre/mun/shared/mun.interfaces';


@Injectable({
  providedIn: 'root'
})
export class MunService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('munApiConfig') private apiConfig: MunApiConfig
  ) {}

  /**
   * Store that holds all the available Municipalities
   */
  getMun(): Observable<MunNom[]> {
    const url = this.apiService.buildUrl(this.apiConfig.list);

    return this.http
      .get(url)
      .pipe(
        map((response: MunNomListResponse) => {
          return this.extractMunFromListResponse(response);
        })
      );
  }

  /**
   * Extract all municipalities in a list from the response service
   * @param MunNomListResponse response
   * @returns MunNom[] List of municipalities
   */
  private extractMunFromListResponse(
    response: MunNomListResponse
  ): MunNom[] {
    return response.data.map(item => this.listItemToMun(item));
  }

  /**
   * Convert a service response item in a MunNom interface
   * @param listItem
   */
   private listItemToMun(
    listItem: MunNom
  ): MunNom {
    return {
      id: listItem.codeGeographique,
      codeGeographique: '' + listItem.codeGeographique,
      nomMunicipalite: listItem.nomMunicipalite,
      current: listItem.current
    };
  }
}
