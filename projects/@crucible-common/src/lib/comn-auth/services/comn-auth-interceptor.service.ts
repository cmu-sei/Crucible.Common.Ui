// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { ComnAuthQuery } from '../state/comn-auth.query';

@Injectable({
  providedIn: 'root',
})
export class ComnAuthInterceptorService implements HttpInterceptor {
  private excludedPaths: Array<string> = [
    'assets/config/settings.json',
    'assets/config/settings.env.json',
  ];

  constructor(private authQuery: ComnAuthQuery) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.isExcluded(request.url)) {
      return next.handle(request) as any;
    }
    return this.authQuery.user$.pipe(
      filter((user) => user !== null),
      take(1),
      switchMap((user) => {
        return next.handle(
          request.clone({
            setHeaders: {
              Authorization: `${user.token_type} ${user.access_token}`,
            },
          })
        );
      })
    );
  }

  private isExcluded(url: string): boolean {
    return this.excludedPaths.includes(url);
  }
}
