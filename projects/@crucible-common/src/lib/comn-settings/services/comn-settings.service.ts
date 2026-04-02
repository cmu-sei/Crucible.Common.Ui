// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Inject, Injectable, Optional, forwardRef } from '@angular/core';
import { Observable, of, zip } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import {
  ComnSettingsConfig,
  COMN_SETTINGS_CONFIG,
} from '../models/comn-settings';

@Injectable({
  providedIn: 'root',
})
export class ComnSettingsService {
  private _url: string;
  private _sharedUrl: string;
  private _envUrl: string;
  private _settings: any = {};
  private _http: HttpClient;

  get url() {
    return this._url;
  }

  set url(value) {
    this._url = value;
  }

  get sharedUrl() {
    return this._sharedUrl;
  }

  set sharedUrl(value) {
    this._sharedUrl = value;
  }

  get envUrl() {
    return this._envUrl;
  }

  set envUrl(value) {
    this._envUrl = value;
  }

  set settings(value) {
    this._settings = value;
  }

  get settings() {
    return this._settings;
  }

  constructor(
    @Optional()
    @Inject(forwardRef(() => COMN_SETTINGS_CONFIG))
    config: ComnSettingsConfig = {
      url: `assets/config/settings.json`,
      sharedUrl: `assets/config/settings.shared.json`,
      envUrl: `assets/config/settings.env.json`,
    },
    private handler: HttpBackend,
  ) {
    this.url = config.url;
    this.sharedUrl = config.sharedUrl;
    this.envUrl = config.envUrl;
    // Use HttpBackend directly to avoid HTTP_INTERCEPTOR dependency cycle.
    // https://stackoverflow.com/questions/56928730/app-initializer-and-dependent-token-resolution-issue
    this._http = new HttpClient(this.handler);
  }

  private deepMerge(target, source) {
    const result = { ...target, ...source };
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key] = this.deepMerge(target[key], source[key]);
      }
    }
    return result;
  }

  load(): Promise<any> {
    return new Promise<any>((resolve) => {
      zip(
        this._http.get(this.url).pipe(
          catchError((err) => {
            return this.notify(err);
          }),
        ),
        this._http.get(this.sharedUrl).pipe(
          catchError((err) => {
            return this.notify(err);
          }),
        ),
        this._http.get(this.envUrl).pipe(
          catchError((err) => {
            return this.notify(err);
          }),
        ),
      )
        .pipe(
          // Remove error objects, typically these are files or endpoints that don't exist.
          map((result) =>
            result.filter((f) => !(f instanceof HttpErrorResponse)),
          ),
          catchError((err) => {
            return this.notify(err);
          }),
        )
        .subscribe((result: any) => {
          this.settings = result.reduce(
            (p, v) => this.deepMerge(p, v),
            this._settings,
          );
          this.notify(this.settings).pipe(take(1)).subscribe();
          resolve(true);
        });
    });
  }

  notify(error: any): Observable<any> {
    return of(error).pipe(
      tap((e) => {
        switch (e.constructor) {
          case HttpErrorResponse: {
            console.log(error.message);
            break;
          }
          default: {
            console.log(JSON.stringify(error, null, 2));
          }
        }
      }),
    );
  }
}
