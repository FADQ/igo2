import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { ApiService } from 'src/lib/core/api';

import {
  ClientParcelPro,
  ClientParcelProApiConfig,
  ClientParcelProProduction,
} from './client-parcel-pro.interfaces';
import {
  ClientParcelProCategories,
  ClientParcelProProductions
} from './client-parcel-pro.enums';

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

    const properties = Object.assign(data.properties, {});
    const parcelPro = Object.assign({}, data, {properties}) as ClientParcelPro;
    return of(parcelPro);
  }

  /**
   * Get productions for a given category
   * @param categoryCode Category code
   * @returns Observable of the productions
   */
  getParcelProCategoryProductions(categoryCode: string): Observable<ClientParcelProProduction[]> {
    const category = ClientParcelProCategories[categoryCode];
    const productionCodes = category ? category.productions : [];
    return of(
        productionCodes
          .sort()
          .map((productionCode: string) => {
            return ClientParcelProProductions[productionCode];
          })
      );
  }

  /**
   * Get cultivars for a given production
   * @param categoryCode Category code
   * @returns Observable of the productions
   */
  getParcelProProductionCultivars(productionCode: string): Observable<string[]> {
    const production = ClientParcelProProductions[productionCode];
    const cultivars = production ? production.cultivars : [];
    return of(cultivars);
  }
}
