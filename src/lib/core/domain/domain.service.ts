import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { FormFieldSelectChoice } from '@igo2/common';

import { DomainChoicesResponse } from './domain.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DomainService {

  private cache: { [key: string]: FormFieldSelectChoice[]} = {};

  constructor(private http: HttpClient) {}

  getChoices(url: string): Observable<FormFieldSelectChoice[]> {
    if (this.cache[url] !== undefined) {
      return of(this.cache[url]);
    }

    return this.http
      .get(url)
      .pipe(
        map((response: DomainChoicesResponse) => {
          return this.extractChoicesFromResponse(response);
        }),
        tap((choices: FormFieldSelectChoice[]) => {
          this.cacheChoices(url, choices);
        })
      );
  }

  private extractChoicesFromResponse(response: DomainChoicesResponse): FormFieldSelectChoice[] {
    const items = response.data || [];
    return items.map(item => Object.create({
      value: item.code,
      title: item.descriptionAbregeeFrancais
    }));
  }

  private cacheChoices(url, choices: FormFieldSelectChoice[]) {
    this.cache[url] = choices;
  }
}
