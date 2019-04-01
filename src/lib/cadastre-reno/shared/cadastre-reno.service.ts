import { Injectable, Inject } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  SearchResult,
  SearchSource,
  SearchSourceOptions,
  TextSearch,
  Feature
} from '@igo2/geo';

import { CadastreRenoFeature } from 'src/lib/cadastre-reno/shared/cadastre-reno.interfaces';

import { ClientState } from 'src/app/modules/client/client.state';
import { CADASTRE_RENO } from '../cadastre-reno.enum';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '@igo2/core';

@Injectable()
export class CadastreRenoSearchResultFormatter {
  constructor(private languageService: LanguageService) {}

  formatResult(result: SearchResult<Feature>): SearchResult<Feature> {
    return result;
  }
}

/**
 * Client search source
 */
@Injectable()
export class CadastreRenoSearchSource extends SearchSource implements TextSearch {

  static id = 'cadastreReno';
  static type = CADASTRE_RENO;

  constructor(
    private http: HttpClient,
    @Inject('options') options: SearchSourceOptions,
    @Inject(CadastreRenoSearchResultFormatter)
    private formatter: CadastreRenoSearchResultFormatter
  ) {
    super(options);
  }

  getId(): string { return CadastreRenoSearchSource.id; }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'Cadastre rénové',
      searchUrl: 'https://carto.cptaq.gouv.qc.ca/php/find_lot_v1.php?numero=__NO_CADAS__&epsg=32198'
    };
  }

  /**
   * Search a client by num
   * @param term Client num
   * @returns Observable of <SearchResult<Client>[]
   */
  search(term?: string): Observable<SearchResult<CadastreRenoFeature>[]> {
    return this.http
    .get(this.searchUrl)
    .pipe(map((response: CadastreRenoFeature) => this.extractResults(response)));
}

  private extractResults(response: CadastreRenoFeature): SearchResult<CadastreRenoFeature>[] {
    return [this.dataToResult(response)];
  }

  private dataToResult(data: CadastreRenoFeature): SearchResult<CadastreRenoFeature> {
    return {
      source: this,
      data: data,
      meta: {
        dataType: CADASTRE_RENO,
        id: [this.getId(), data.properties.noCadastre].join('.'),
        title: data.properties.noCadastre.toString(),
        icon: 'grid'
      }
    };
  }

}
