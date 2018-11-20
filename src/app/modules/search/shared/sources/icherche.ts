import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { removeKeys } from '../../../utils/object';
import { FEATURE } from '../../../feature/shared/feature.enum';
import { Feature } from '../../../feature/shared/feature.interface';
import { SearchResult } from '../search.interface';
import { SearchSource, TextSearch, ReverseSearch } from './source';
import { SearchSourceOptions } from './source.interface';
import {
  IChercheData,
  IChercheResponse,
  IChercheReverseData,
  IChercheReverseResponse
} from './icherche.interface';

export class IChercheSearchSourceBase extends SearchSource  {

  constructor(protected options: SearchSourceOptions, protected http: HttpClient) {
    super();
    this.initOptions(options);
  }

  getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'ICherche Québec'
    };
  }
}

@Injectable()
export class IChercheSearchSource
    extends IChercheSearchSourceBase implements TextSearch {

  static id = 'icherche';
  static type = FEATURE;
  static propertiesBlacklist: Array<string> = [
    '@timestamp',
    '@version',
    'recherche',
    'id',
    'cote',
    'geometry',
    'bbox'
  ];

  getId(): string {
    return IChercheSearchSource.id;
  }

  getDefaultOptions(): SearchSourceOptions {
    return Object.assign(super.getDefaultOptions(), {
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/icherche/geocode'
    });
  }

  search(term: string): Observable<SearchResult<Feature>[]> {
    const params = this.computeRequestParams(term);
    return this.http
      .get(this.searchUrl, { params })
      .pipe(
        map((response: IChercheResponse) => this.extractResults(response))
      );
  }

  private computeRequestParams(term: string): HttpParams {
    return new HttpParams({
      fromObject: Object.assign({
        q: term,
        geometries: 'geom',
        type: 'adresse,code_postal,route,municipalite,mrc,region_administrative'
      }, this.params)
    });
  }

  private extractResults(response: IChercheResponse): SearchResult<Feature>[] {
    return response.features.map((data: IChercheData) => {
      return this.dataToResult(data);
    });
  }

  private dataToResult(data: IChercheData): SearchResult<Feature> {
    const properties = this.computeProperties(data);

    return {
      source: this,
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry: data.geometry,
        extent: data.bbox,
        properties: properties,
        meta: {
          title: data.properties.recherche
        }
      },
      meta: {
        dataType: FEATURE,
        id: [this.getId(), properties.type, data._id].join('.'),
        title: data.properties.recherche,
        titleHtml: data.highlight,
        icon: 'place'
      }
    };
  }

  private computeProperties(data: IChercheData): { [key: string]: any } {
    const properties = removeKeys(
      data.properties,
      IChercheSearchSource.propertiesBlacklist
    );
    return Object.assign(properties, {type: data.doc_type});
  }
}

@Injectable()
export class IChercheReverseSearchSource
    extends IChercheSearchSourceBase implements ReverseSearch {

  static id = 'icherchereverse';
  static type = FEATURE;
  static propertiesBlacklist: Array<string> = ['doc_type'];

  getId(): string {
    return IChercheReverseSearchSource.id;
  }

  getDefaultOptions(): SearchSourceOptions {
    return Object.assign(super.getDefaultOptions(), {
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/icherche/xy'
    });
  }

  reverseSearch(lonLat: [number, number], distance?: number): Observable<SearchResult<Feature>[]> {
    const params = this.computeRequestParams(lonLat, distance);
    return this.http
      .get(this.searchUrl, { params })
      .pipe(
        map((response: IChercheReverseResponse) => {
          return this.extractResults(response);
        })
      );
  }

  private computeRequestParams(lonLat: [number, number], distance?: number): HttpParams {
    return new HttpParams({
      fromObject: Object.assign({
        loc: lonLat.join(','),
        distance: distance ? String(distance) : '',
        geometries: 'geom',
        type: 'adresse,municipalite,mrc,regadmin'
      }, this.params)
    });
  }

  private extractResults(response: IChercheReverseResponse): SearchResult<Feature>[] {
    return response.features.map((data: IChercheReverseData) => {
      return this.dataToResult(data);
    });
  }

  private dataToResult(data: IChercheReverseData): SearchResult<Feature> {
    const properties = this.computeProperties(data);
    const extent = this.computeExtent(data);

    return {
      source: this,
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry: data.geometry,
        extent: extent,
        properties: properties,
        meta: {
          title: data.properties.nom
        }
      },
      meta: {
        dataType: FEATURE,
        id: [this.getId(), properties.type, data._id].join('.'),
        title: data.properties.nom,
        icon: 'place'
      }
    };
  }

  private computeProperties(data: IChercheReverseData): { [key: string]: any } {
    const properties = removeKeys(
      data.properties,
      IChercheReverseSearchSource.propertiesBlacklist
    );
    return Object.assign(properties, {type: data.properties.doc_type});
  }

  private computeExtent(data: IChercheReverseData): [number, number, number, number] {
    return [data.bbox[0], data.bbox[2], data.bbox[1], data.bbox[3]];
  }
}
