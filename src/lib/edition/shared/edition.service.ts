import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/lib/core/api';

import { Feature } from '@igo2/geo';

import {ErreurValidation, EditionApiConfig} from '../shared/edition.interfaces';

@Injectable()
export class EditionService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('editionApiConfig') private apiConfig: EditionApiConfig
  ) {}

  validateGeometry(
    feature: Feature
  ): Observable<string> {

    const url = this.apiService.buildUrl(this.apiConfig.validGeometry, {});
    return this.http.post(url, {"geometrie": feature.geometry})
    .pipe(map((data: ErreurValidation) => {
      if (data.messages.length > 0 ) {
        return data.messages[0].libelle;
      } else { return undefined;}
    }));
  }
}
