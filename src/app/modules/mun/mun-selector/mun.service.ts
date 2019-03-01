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
} from './mun.interfaces';


@Injectable({
  providedIn: 'root'
})
export class MunService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('munApiConfig') private apiConfig: MunApiConfig
  ) {}

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

  private extractMunFromListResponse(
    response: MunNomListResponse
  ): MunNom[] {
    return response.data.map(item => this.listItemToMun(item));
  }

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
