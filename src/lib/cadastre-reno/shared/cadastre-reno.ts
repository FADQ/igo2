import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Geometry as GeoJSONGeometry } from 'geojson';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import * as olFormat from 'ol/format';

import {
  FEATURE,
  FeatureGeometry,
  SearchResult,
  SearchSource,
  SearchSourceOptions,
  TextSearch
} from '@igo2/geo';

import { CadastreRenoFeature } from './cadastre-reno.interfaces';
import { CADASTRE_RENO } from './cadastre-reno.enums';

/**
 * Cadastre search source
 */
@Injectable()
export class CadastreRenoSearchSource extends SearchSource implements TextSearch {

  static id = 'cadastreReno';
  static type = CADASTRE_RENO;

  constructor(
    private http: HttpClient,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options);
  }

  getId(): string { return CadastreRenoSearchSource.id; }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'Cadastre rénové',
      searchUrl: 'https://carto.cptaq.gouv.qc.ca/php/find_lot_v1.php'
    };
  }

  /**
   * Computes request params
   * @param term A cadastre number to search
   * @returns Parameters for http structure
   */
  private computeRequestParams(term: string): HttpParams {
    return new HttpParams({
      fromObject: Object.assign(
        {
          numero: term.replace(/;/g, ','),
          epsg: '4326'
        },
        this.params
      )
    });
  }

  /**
   * Search a cadastre by num
   * @param term Cadastre number. Could be a list of cadastre numbers separated by «;»
   * @returns Observable of <SearchResult<Cadastre>[]
   */
  search(term?: string): Observable<SearchResult<CadastreRenoFeature>[]> {
    let blnSearch: boolean = false;
    let termRevisedText: string;
    // if there's more than one cadastre number to search
    if (term.search(';')) {
      const terms = term.split(';');
      let tabTermsRevised:string[] = [];
      // Keep just numbers from each term
      terms.forEach((noCadastre: string) => {
        const noCadastreNumber = noCadastre.replace(/[^0-9]/g, '');
        // if cadastre number is greater or equal to 5, keep it
        if (noCadastreNumber.length >= 5) {
          tabTermsRevised.push(noCadastreNumber);
        }
      });
      // if there's at least one cadastre number
      if (tabTermsRevised.length >= 1) {
        // Transform to text
        termRevisedText = tabTermsRevised.join(';');
        // There's a search to do
        blnSearch = true;
      }
    } 
    // There's only one cadastre number
    else {
      // Keep just numbers
      termRevisedText = term.replace(/[^0-9]/g, '');
      // There's a search to do if there's at least 5 digit to cadastre number
      if (termRevisedText.length >= 5) { blnSearch = true; }
    }

    // If there's a search to do
    if (blnSearch) {
      const params = this.computeRequestParams(termRevisedText);

      return this.http
      .get(this.searchUrl, {
        params,
        responseType: 'text'
      })
      .pipe(map((response: string) => this.extractResults(response)));
    } else { return of([]); }
  }

  /**
   * Extracts results from the response of service
   * @param response 
   * @returns results 
   */
  private extractResults(response: string): SearchResult<CadastreRenoFeature>[] {
    const textResults = response.split('<br />');
    return textResults
      .map((textResult: string) => this.dataToResult(textResult))
      .filter((result: SearchResult<CadastreRenoFeature>) => result !== undefined);
  }

  /**
   * Convert text result of response to data structure SearchResult
   * @param cadastre 
   * @returns SearchResult of CadastreRenoFeature
   */
  private dataToResult(cadastre: string): SearchResult<CadastreRenoFeature> {
    const propertiesCadastre = cadastre.split(';');
    if (propertiesCadastre.length < 7) {
      return undefined;
    }
    const geometry = this.convertWKTtoGeojson(propertiesCadastre[7]);
    return {
      source: this,
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry: geometry as FeatureGeometry,
        extent: undefined,
        properties: {
          "Numéro de Cadastre": propertiesCadastre[0]
        },
        meta: {
          id: this.getId(),
          title: 'Cadastre rénové'
        }
      },
      meta: {
        dataType: FEATURE,
        id: propertiesCadastre[0],
        title: propertiesCadastre[0],
        icon: 'grid_on'
      }
    };
  }

  /**
   * Converts a WKT format to Geojson format
   * @param wkt Data to WKT format
   * @returns Data to Geojson format
   */
  private convertWKTtoGeojson(wkt: string): GeoJSONGeometry {
    const olFormatWKT = new olFormat.WKT();
    const olFormatGeoJson = new olFormat.GeoJSON();
    const olGeometry = olFormatWKT.readGeometry(wkt);
    return olFormatGeoJson.writeGeometryObject(olGeometry);
  }
}
