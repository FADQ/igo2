import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/lib/core/api';
import { getEntityId } from 'src/lib/entity';

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import {
  ClientSchemaElementLine,
  ClientSchemaElementLineApiConfig,
  ClientSchemaElementLineListResponse,
  ClientSchemaElementLineListResponseItem
} from './client-schema-element.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementLineService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('clientSchemaElementLineApiConfig')
    private apiConfig: ClientSchemaElementLineApiConfig
  ) {}

  getElements(schema: ClientSchema): Observable<ClientSchemaElementLine[]> {
    const url = this.apiService.buildUrl(this.apiConfig.list, {
      schemaId: getEntityId(schema)
    });

    return this.http
      .get(url)
      .pipe(
        map((response: ClientSchemaElementLineListResponse) => {
          return this.extractElementsFromListResponse(response);
        })
      );
  }

  private extractElementsFromListResponse(
    response: ClientSchemaElementLineListResponse
  ): ClientSchemaElementLine[] {
    return response.map(listItem => this.listItemToElement(listItem));
  }

  private listItemToElement(
    listItem: ClientSchemaElementLineListResponseItem
  ): ClientSchemaElementLine {
    const properties = Object.assign({}, listItem.properties);
    return {
      meta: {
        idProperty: 'properties.idElementGeometrique'
      },
      type: listItem.type,
      projection: 'EPSG:4326',
      geometry: listItem.geometry,
      extent: undefined,
      properties
    };
  }
}