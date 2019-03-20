import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/lib/core/api';
import {
  ConcessionResponseItem,
  ConcessionApiConfig,
  ConcessionListResponse,
  ConcessionFeature,
  ConcessionFeatureResponse,
  ConcessionUniqueList,
  ConcessionList,
  ConcessionUnique,
  Concession,
  ConcessionFeatureResponseItem
} from 'src/lib/cadastre/concession/shared/concession.interfaces';

@Injectable()
export class CadastreConcessionService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('concessionApiConfig') private apiConfig: ConcessionApiConfig
  ) {}

  //#region Concession
  /**
   * Get concession from service
   * @returns Observable of concession
   */
  getConcessions(idCadastreOriginaire: number): Observable<ConcessionUnique[]> {

    const url = this.apiService.buildUrl(this.apiConfig.list);

    return of(this.convertResponseToListConcessionUnique([
      {
        "idDesignationSecondaire": "3923",
        "nomDesignationSecondaire": "Rang 14",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "4921",
        "nomDesignationSecondaire": "Rang 15",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "6433",
        "nomDesignationSecondaire": "Rang 15",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "4922",
        "nomDesignationSecondaire": "Rang 16",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "14436",
        "nomDesignationSecondaire": "Rang 16",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "151",
        "nomDesignationSecondaire": "Rang 17",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "14391",
        "nomDesignationSecondaire": "Rang 18",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "15272",
        "nomDesignationSecondaire": "Rang 18",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "7600",
        "nomDesignationSecondaire": "Rang 19",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "11537",
        "nomDesignationSecondaire": "Rang 19",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "15595",
        "nomDesignationSecondaire": "Rang 19",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "9574",
        "nomDesignationSecondaire": "Rang 20",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "14199",
        "nomDesignationSecondaire": "Rang 20",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "15273",
        "nomDesignationSecondaire": "Rang 20",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "874",
        "nomDesignationSecondaire": "Rang 21",
        "noCadastre": "041000"
      },
      {
        "idDesignationSecondaire": "875",
        "nomDesignationSecondaire": "Rang 21",
        "noCadastre": "041000"
      }
    ]));

    /*return this.http
      .post(url, [idCadastreOriginaire])
      .pipe(
        map((response: ConcessionListResponse) => {
          return this.extractConcessionFromListResponse(response);
        })
      );*/
  }

  private convertResponseToListConcessionUnique(response: ConcessionList): ConcessionUniqueList {
    const concessionUniqueList: ConcessionUniqueList = [];
    response.map((item: ConcessionResponseItem) => {
      if (concessionUniqueList.find(
        x => x.listeConcession[0].noCadastre + ' - ' + x.nomConcession ===
         item.noCadastre + ' - ' + item.nomDesignationSecondaire ) === undefined) {
        concessionUniqueList.push(
          {nomConcession: item.noCadastre + ' - ' + item.nomDesignationSecondaire,
            listeConcession: [item]
          });
      } else {
        concessionUniqueList.find(x => x.nomConcession === item.nomDesignationSecondaire).listeConcession.push(item);
      }
    });

    return concessionUniqueList;
  }

  /**
   * Extract all concessions in a list from the response service
   * @param MunListResponse response
   * @returns List of municipalities
   */
  private extractConcessionFromListResponse(
    response: ConcessionListResponse
  ): ConcessionResponseItem[] {
    return response.data.map(item => this.listItemToConcession(item));
  }

  /**
   * Convert a service response item in a MunNom interface
   * @param listItem An item of response municipality service
   */
   private listItemToConcession(
    listItem: ConcessionResponseItem
  ): ConcessionResponseItem {
    return {
      idDesignationSecondaire: listItem.idDesignationSecondaire,
      noCadastre: listItem.noCadastre,
      nomDesignationSecondaire: listItem.nomDesignationSecondaire
    };
  }
  //#endregion

//#region ConcessionFeature

  getConcessionFeatureByNum(listConcession: ConcessionList): Observable<ConcessionFeature[]> {

    const url = this.apiService.buildUrl(this.apiConfig.points);
    const listIdConcession: string[] = [];

    listConcession.map((item: Concession) => {
      listIdConcession.push(item.idDesignationSecondaire);
    });

    return of(
      [
        {
          "type": "Feature",
          projection: 'EPSG:4326',
          "geometry": {
            "type": "Point",
            "coordinates": [
              -72.67161,
              45.754161
            ]
          },
          "properties": {
            "idDesignationSecondaire": 4921,
            "nomDesignationSecondaire": "Rang 15",
            "noCadastre": "041000"
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              -72.677136,
              45.745837
            ]
          },
          "properties": {
            "idDesignationSecondaire": 6433,
            "nomDesignationSecondaire": "Rang 15",
            "noCadastre": "041000"
          }
        }
      ].map((response: ConcessionFeatureResponseItem) => {
        return this.extractConcessionFeatureFromResponse(response);
      })
    );

    /*return this.http
      .post(url, listIdConcession)
      .pipe(
        map((response: ConcessionFeatureResponse) => {
          return this.extractConcessionFeatureFromResponse(response);
        })
      );*/
  }

  private extractConcessionFeatureFromResponse(
    response: ConcessionFeatureResponseItem
  ): ConcessionFeature {
    const properties = Object.assign({}, response.properties);
    return {
      meta: {
        id: properties.idDesignationSecondaire,
        mapTitle: properties.nomDesignationSecondaire
      },
      type: response.type,
      projection: 'EPSG:4326',
      geometry: response.geometry,
      extent: undefined,
      properties
    };
  }
//#endregion
}
