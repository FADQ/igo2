import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Feature } from '@igo2/geo';

import { ApiService } from 'src/lib/core';
import { substituteProperties } from 'src/lib/utils';
import {
  Place,
  PlaceCategory,
  PlaceCollectionApi,
  PlaceFeatureApi,
  PlaceMapper,
} from './place.interfaces';

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

  /**
   * Get the places of a category (without geometry)
   * @param category Category
   * @returns Observable of the places
   */
  getPlacesByCategory(category: PlaceCategory): Observable<Place[]> {
    const api = category.collection;
    const url = this.apiService.buildUrl(api.uri);
    return this.http
      .get(url)
      .pipe(map(res => this.extractPlacesFromResponse(res, category)));
  }

  /**
   * Get a place's feature (geometry)
   * @param category Category
   * @param place Place
   * @returns Observable of the place's feature
   */
  getPlaceFeatureByCategory(category: PlaceCategory, place: Place): Observable<Feature> {
    const api = category.feature;
    const url = this.apiService.buildUrl(api.uri, {id: place.id});
    return this.http
      .get(url)
      .pipe(map(res => this.extractPlaceFeatureFromResponse(res, place)));
  }

  /**
   * Extract places from list response
   * @param response List response
   * @param category Category
   * @returns Places list
   */
  private extractPlacesFromResponse(response: object, category: PlaceCategory): Place[] {
    let data = response;
    if (response.hasOwnProperty('data')) {
      data = response['data'];
    }

    const api = category.collection;
    let results: object[] = [];
    if (data instanceof Array) {
      results = data as object[];
    } else if (api.resultsProperty !== undefined && data.hasOwnProperty(api.resultsProperty)) {
      results = data[api.resultsProperty];
    }

    const mapper = {
      idProperty: api.idProperty || PlaceService.defaultPlaceMapper.idProperty,
      titleProperty: api.titleProperty || PlaceService.defaultPlaceMapper.titleProperty,
      title: api.title
    };

    return results.map(result => {
      return this.formatPlaceResult(result, mapper);
    });
  }

  /**
   * Format a place result
   * @param result Result
   * @param mapper Attribute mapper
   * @returns Place
   */
  private formatPlaceResult(result: object, mapper: PlaceMapper): Place {
    const id = String(result[mapper.idProperty]);
    const title = this.computeTitle(result, mapper) || id;
    return {
      id: id,
      title: title
    };
  }

  /**
   * Extract place feature from response
   * @param response Feature response
   * @param place Place
   * @returns Place feature
   */
  private extractPlaceFeatureFromResponse(response: object, place: Place): Feature | undefined {
    if (Object.getOwnPropertyNames(response).length > 0) {
      return this.formatPlaceFeatureResult(response, place);
    }
    return;
  }

  /**
   * Format a place feature result
   * @param result Result
   * @param place Place
   * @returns Feature
   */
  private formatPlaceFeatureResult(result: object, place: Place): Feature {
    return Object.assign({
      projection: 'EPSG:4326',
      meta: {
        mapTitle: place.title
      }
    }, result) as Feature;
  }

  /**
   * Compute a place's title
   * @param result Result
   * @param mapper Attribute mapper
   * @returns Place title
   */
  private computeTitle(result: object, mapper: PlaceMapper): string | undefined {
    let title;
    if (mapper.titleProperty !== undefined) {
      title = result[mapper.titleProperty];
    }

    if (title === undefined && mapper.title !== undefined) {
      title = substituteProperties(
        mapper.title,
        result as {[key: string]: string | number}
      );
    }

    return title;
  }
}
