import { Injectable, Inject } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  SearchResult,
  SearchSource,
  SearchSourceOptions,
  TextSearch
} from '@igo2/geo';

import { CLIENT, Client, ClientService, validateClientNum } from 'src/lib/client';
import { ClientData } from './client.interfaces';

/**
 * Client search source
 */
@Injectable()
export class ClientSearchSource extends SearchSource implements TextSearch {

  static id = 'client';
  static type = CLIENT;
  static termMinLength = 3;
  static termMaxLength = 7;

  constructor(
    private clientService: ClientService,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options);
  }

  getId(): string { return ClientSearchSource.id; }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'Client (FADQ)'
    };
  }

  /**
   * Search a client by num
   * @param term Client num
   * @returns Observable of <SearchResult<Client>[]
   */
  search(term?: string): Observable<SearchResult<Client>[]> {
    if (!validateClientNum(term)) {
      return of([]);
    }

    return this.clientService.getClientByNum(term)
      .pipe(
        map((response: ClientData) => {
          if (response === undefined) {
            return [];
          }
          return this.extractResults(response);
        })
      );
  }

  private extractResults(response: ClientData): SearchResult<Client>[] {
    return [this.dataToResult(response)];
  }

  private dataToResult(data: ClientData): SearchResult<Client> {
    return {
      source: this,
      data: data,
      meta: {
        dataType: CLIENT,
        id: [this.getId(), data.info.numero].join('.'),
        title: data.info.nom,
        icon: 'person'
      }
    };
  }

}
