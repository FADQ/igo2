import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/lib/core/api';
import { Client } from '../../shared/client.interfaces';
import {
  ClientSchema,
  ClientSchemaApiConfig,
  ClientSchemaListResponse,
  ClientSchemaListResponseItem,
  ClientSchemaCreateData,
  ClientSchemaCreateResponse,
  ClientSchemaUpdateData,
  ClientSchemaUpdateResponse,
  ClientSchemaTransferResponse,
  ClientSchemaDuplicateResponse
} from './client-schema.interfaces';

@Injectable()
export class ClientSchemaService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('clientSchemaApiConfig') private apiConfig: ClientSchemaApiConfig
  ) {}

  getSchemas(client: Client): Observable<ClientSchema[]> {
    const url = this.apiService.buildUrl(this.apiConfig.list, {clientNum: client.info.numero});
    return this.http
      .get(url)
      .pipe(
        map((response: ClientSchemaListResponse) => {
          return this.extractSchemasFromListResponse(response);
        })
      );
  }

  createSchema(data: ClientSchemaCreateData): Observable<ClientSchema> {
    const url = this.apiService.buildUrl(this.apiConfig.create);

    return this.http
      .post(url, data)
      .pipe(
        map((response: ClientSchemaCreateResponse) => {
          return this.extractSchemaFromCreateResponse(response);
        })
      );
  }

  updateSchema(schema: ClientSchema, data: ClientSchemaUpdateData): Observable<ClientSchema> {
    const url = this.apiService.buildUrl(this.apiConfig.update);

    return this.http
      .post(url, data)
      .pipe(
        map((response: ClientSchemaUpdateResponse) => {
          return this.extractSchemaFromUpdateResponse(response);
        })
      );
  }

  deleteSchema(schema: ClientSchema): Observable<any> {
    const url = this.apiService.buildUrl(this.apiConfig.delete, {
      id: schema.id
    });

    return this.http.post(url, {});
  }

  duplicateSchema(schema: ClientSchema): Observable<ClientSchema> {
    const url = this.apiService.buildUrl(this.apiConfig.duplicate, {
      id: schema.id
    });

    return this.http
      .post(url, {})
      .pipe(
        map((response: ClientSchemaDuplicateResponse) => {
          return this.extractSchemaFromDuplicateResponse(response);
        })
      );
  }

  transferSchema(schema: ClientSchema, numClient: string): Observable<string[]> {
    const url = this.apiService.buildUrl(this.apiConfig.update);
    const data = Object.assign({}, schema, {numeroClient: numClient});
    return this.http
      .post(url, data)
      .pipe(
        map((response: ClientSchemaTransferResponse) => {
          return response.messages;
        })
      );
  }

  private extractSchemasFromListResponse(
    response: ClientSchemaListResponse
  ): ClientSchema[] {
    const listItems = response.data || [];
    return listItems.map(listItem => this.listItemToSchema(listItem));
  }

  private listItemToSchema(listItem: ClientSchemaListResponseItem): ClientSchema {
    return this.extractSchemaFromListResponseItem(listItem);
  }

  private extractSchemaFromCreateResponse(
    response: ClientSchemaCreateResponse
  ): ClientSchema {
    return this.extractSchemaFromListResponseItem(response.data);
  }

  private extractSchemaFromUpdateResponse(
    response: ClientSchemaUpdateResponse
  ): ClientSchema {
    return this.extractSchemaFromListResponseItem(response.data);
  }

  private extractSchemaFromDuplicateResponse(
    response: ClientSchemaDuplicateResponse
  ): ClientSchema {
    return this.extractSchemaFromListResponseItem(response.data);
  }

  private extractSchemaFromListResponseItem(item: ClientSchemaListResponseItem): ClientSchema {
    return Object.assign({}, item, {
      type: item.typeSchema.code,
      descriptionType: item.typeSchema.descriptionAbregeeFrancais,
      etat: item.etatSchema.code,
      descriptionEtat: item.etatSchema.descriptionAbregeeFrancais
    });
  }

}
