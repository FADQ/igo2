import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/lib/core/api';
import {
  CadastreName,
  CadastreResponseItem,
  CadastreApiConfig,
  CadastreListResponse,
  CadastreFeature,
  CadastreFeatureResponseItem,
  CadastreFeatureListResponse
} from 'src/lib/cadastre/cadastre/shared/cadastre.interfaces';

@Injectable()
export class CadastreCadastreService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('cadastreApiConfig') private apiConfig: CadastreApiConfig
  ) {}

  //#region Cadastre
  /**
   * Get municipalities from service
   * @returns Observable of municipalities
   */
  getCadastres(
     codeGeographique: string
    ): Observable<CadastreResponseItem[]> {
    const url = this.apiService.buildUrl(this.apiConfig.list, {codeGeo: codeGeographique});

    return this.http
      .get(url)
      .pipe(
        map((response: CadastreListResponse) => {
          return this.extractCadastreFromListResponse(response);
        })
      );
  }

  /**
   * Extract all municipalities in a list from the response service
   * @param MunListResponse response
   * @returns List of municipalities
   */
  private extractCadastreFromListResponse(
    response: CadastreListResponse
  ): CadastreResponseItem[] {
    return response.data.map(item => this.listItemToCadastre(item));
  }

  /**
   * Convert a service response item in a MunNom interface
   * @param listItem An item of response municipality service
   */
   private listItemToCadastre(
    listItem: CadastreResponseItem
  ): CadastreResponseItem {
    return {
      idCadastreOriginaire: listItem.idCadastreOriginaire,
      nomCadastre: listItem.nomCadastre,
      noCadastre: listItem.noCadastre,
      codeCadastre: listItem.codeCadastre,
      recherche: listItem.recherche
    };
  }
  //#endregion

//#region CadastreFeature

getCadastreFeatureByNum(idCadastreOriginaire: number): Observable<CadastreFeature[]> {
  const url = this.apiService.buildUrl(this.apiConfig.surfaces, {idCadastre: idCadastreOriginaire});

  return this.http
    .get(url)
    .pipe(
      map((response: CadastreFeatureListResponse) => {
        return this.extractCadastreFeatureFromResponse(response);
      })
    );
}

private extractCadastreFeatureFromResponse(
  response: CadastreFeatureListResponse
): CadastreFeature[] {
  return [response].map(item => this.listItemToCadastreFeature(item.data));
}

private listItemToCadastreFeature(
  listItem: CadastreFeatureResponseItem
): CadastreFeature {
  const properties = Object.assign({}, listItem.properties);
  return {
    meta: {
      id: properties.idCadastreOriginaire,
      mapTitle: properties.nomCadastreOriginaire
    },
    type: listItem.type,
    projection: 'EPSG:4326',
    geometry: listItem.geometry,
    extent: undefined,
    properties
  };
}
//#endregion
}
