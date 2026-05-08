import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Feature } from '@igo2/geo';

import { ApiService } from 'src/lib/core';
import { substituteProperties } from 'src/lib/utils';
import {
  Place,
  PlaceCategory,
  PlaceMapper
} from './place.interfaces';

// 🔒 base JSON typée
type JsonRecord = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})

export class PlaceService {

  static defaultPlaceMapper: PlaceMapper = {
    idProperty: 'id',
    titleProperty: 'title'
  };

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  // -------------------------
  // PUBLIC API
  // -------------------------

  getPlacesByCategory(category: PlaceCategory): Observable<Place[]> {
    const api = category.collection;
    const url = this.apiService.buildUrl(api.uri);

    return this.http.get(url).pipe(
      map(res => this.extractPlacesFromResponse(res, category))
    );
  }

  getPlaceFeatureByCategory(
    category: PlaceCategory,
    place: Place
  ): Observable<Feature | undefined> {
    const api = category.feature;
    const url = this.apiService.buildUrl(api.uri, { id: place.id });

    return this.http.get(url).pipe(
      map(res => this.extractPlaceFeatureFromResponse(res, place))
    );
  }

  // -------------------------
  // EXTRACTION PLACES
  // -------------------------

  private extractPlacesFromResponse(
    response: unknown,
    category: PlaceCategory
  ): Place[] {

    let data: unknown = response;

    if (this.isRecord(response) && this.hasKey(response, 'data')) {
      data = response['data'];
    }

    const api = category.collection;
    let results: unknown[] = [];

    if (Array.isArray(data)) {
      results = data;
    } else if (
      this.isRecord(data) &&
      api.resultsProperty !== undefined &&
      this.hasKey(data, api.resultsProperty)
    ) {
      const value = data[api.resultsProperty];

      if (Array.isArray(value)) {
        results = value;
      }
    }

    const mapper: PlaceMapper = {
      idProperty: api.idProperty || PlaceService.defaultPlaceMapper.idProperty,
      titleProperty: api.titleProperty || PlaceService.defaultPlaceMapper.titleProperty,
      title: api.title
    };

    return results
      .filter(this.isRecord)
      .map(result => this.formatPlaceResult(result, mapper));
  }

  private formatPlaceResult(
    result: Record<string, unknown>,
    mapper: PlaceMapper
  ): Place {

    const idRaw = result[mapper.idProperty];

    const id =
      typeof idRaw === 'string' || typeof idRaw === 'number'
        ? String(idRaw)
        : '';

    const title = this.computeTitle(result, mapper) || id;

    return { id, title };
  }

  // -------------------------
  // FEATURE EXTRACTION
  // -------------------------

  private extractPlaceFeatureFromResponse(
    response: unknown,
    place: Place
  ): Feature | undefined {

    if (!this.isRecord(response)) {
      return undefined;
    }

    if (Object.keys(response).length === 0) {
      return undefined;
    }

    return this.formatPlaceFeatureResult(response, place);
  }

  private formatPlaceFeatureResult(
    result: Record<string, unknown>,
    place: Place
  ): Feature {

    const feature: Partial<Feature> = {
      projection: 'EPSG:4326',
      meta: {
        id: place.id,
        mapTitle: place.title
      }
    };

    return Object.assign({}, feature, result) as Feature;
  }

  // -------------------------
  // TITLE
  // -------------------------

  private computeTitle(
    result: JsonRecord,
    mapper: PlaceMapper
  ): string | undefined {

    let title: unknown;

    if (mapper.titleProperty !== undefined) {
      title = result[mapper.titleProperty];
    }

    if (typeof title === 'string' || typeof title === 'number') {
      return String(title);
    }

    if (title === undefined && mapper.title !== undefined) {
      return substituteProperties(
        mapper.title,
        result as Record<string, string | number>
      );
    }

    return undefined;
  }

  // -------------------------
  // TYPE GUARDS
  // -------------------------

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private hasKey<T extends string>(
    obj: Record<string, unknown>,
    key: T
  ): obj is Record<T, unknown> {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }
}
