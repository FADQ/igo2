
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

    constructor(private apiService: ApiService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if (request.url.startsWith(this.apiService.getBaseUrl())) {
        request = request.clone({
            withCredentials: true
        });
      }

      return next.handle(request);
    }
}