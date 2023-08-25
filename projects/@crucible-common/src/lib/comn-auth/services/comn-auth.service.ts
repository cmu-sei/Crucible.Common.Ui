// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { forwardRef, Inject, Injectable, NgZone } from '@angular/core';
import {
  Log, User,
  UserManager,
  WebStorageStateStore
} from 'oidc-client';
import { ComnSettingsService } from '../../comn-settings/services/comn-settings.service';
import { Theme } from '../state/comn-auth.model';
import { ComnAuthQuery } from '../state/comn-auth.query';
import { ComnAuthStore } from '../state/comn-auth.store';
import { Observable, fromEvent, interval, merge, Subscription, of } from 'rxjs';
import { delay, switchMap, take, skipWhile, tap } from 'rxjs/operators';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root',
})
export class ComnAuthService {
  private userManager: UserManager;
  private user: User;
  user$ = this.authQuery.user$;
  inactivitySubscription = new Subscription();
  inactivityTime: number = 3600;
  timeLapsedSinceInactivity: number = 0;
  observeable$: Observable<any>;
  mergedEventObservable$: Observable<any>;
  inactivityTimerEvent: Array<any>[] = [
    [document, 'click'],
    [document, 'wheel'],
    [document, 'scroll'],
    [document, 'mousemove'],
    [document, 'keyup'],
    [window, 'resize'],
    [window, 'scroll'],
    [window, 'mousemove']
  ];
  tokenExpiredSubscription = new Subscription();

  constructor(
    @Inject(forwardRef(() => ComnSettingsService))
    private settingsService: ComnSettingsService,
    private store: ComnAuthStore,
    private authQuery: ComnAuthQuery,
    public ngZone: NgZone,
    private jwtHelper: JwtHelperService
  ) {
    Log.logger = console;

    if (this.settingsService.settings.UseLocalAuthStorage) {
      this.settingsService.settings.OIDCSettings.userStore = new WebStorageStateStore(
        { store: window.localStorage }
      );
    }
    this.userManager = new UserManager(
      this.settingsService.settings.OIDCSettings
    );
    this.userManager.events.addUserLoaded((user) => {
      this.onTokenLoaded(user);
    });

    this.userManager.getUser().then((user) => {
      if (user != null && user.profile != null) {
        this.onTokenLoaded(user);
      }
    });

    this.inactivityTime =
      this.settingsService.settings.inactivityTime ?
      this.settingsService.settings.inactivityTime :
      this.inactivityTime;

    // activity events observable
    let observableArray$: Observable<any>[] = [];
    this.inactivityTimerEvent.forEach(x => {
      observableArray$.push(fromEvent(x[0], x[1]))
    })
    this.mergedEventObservable$ = merge(...observableArray$);
    this.startInactivityMonitor();
  }

  public isAuthenticated(): Promise<boolean> {
    return this.userManager.getUser().then((user) => {
      return user != null && !user.expired;
    });
  }

  public startAuthentication(url: string): Promise<User> {
    this.userManager.signinRedirect({ state: url });
    return this.userManager.signinRedirectCallback(url);
  }

  public completeAuthentication(url: string): Promise<User> {
    return this.userManager.signinRedirectCallback(url);
  }

  public startSilentAuthentication(): Promise<User> {
    return this.userManager.signinSilent();
  }

  public completeSilentAuthentication(): Promise<User> {
    return this.userManager.signinSilentCallback();
  }

  public getAuthorizationHeader(): string {
    return `${this.user.token_type} ${this.user.access_token}`;
  }

  public getAuthorizationToken(): string {
    return this.user.access_token;
  }

  public logout() {
    return this.userManager.signoutRedirect();
  }

  public setUserTheme(theme: Theme) {
    this.store.update({ ui: { theme } });
  }

  private onTokenLoaded(user) {
    this.user = user;
    this.store.update({ user });
    this.setExpirationTimer();
  }

  startInactivityMonitor(): void {
    this.ngZone.runOutsideAngular(() => {
      this.observeable$ = this.mergedEventObservable$
      .pipe(
        switchMap(ev => interval(1000).pipe(take(this.inactivityTime))),
        // tap(value => this.isItTimeToShowPopUp(value)),
        skipWhile((x) => {
          console.log('timeLapsedSinceInactivity = ' + x.toString());
          this.timeLapsedSinceInactivity = x;
          return x != this.inactivityTime - 1
        })
      );
      this.subscribeObservable();
    })
  }

  subscribeObservable() {
    this.inactivitySubscription = this.observeable$.subscribe((x) => {
      this.inactivitySubscription.unsubscribe();
      this.logout();
    })
  }

  setExpirationTimer() {
    const expirationDate = this.jwtHelper.getTokenExpirationDate(this.user.access_token);
    const currentDate = new Date();
    const expirationMilliseconds = expirationDate.valueOf() - currentDate.valueOf();
    this.tokenExpiredSubscription.unsubscribe();
    this.tokenExpiredSubscription = of(null).pipe(delay(expirationMilliseconds)).subscribe((expired) => {
      console.log('Access Token Expired.');
      this.tokenExpiredSubscription.unsubscribe();
      this.logout();
    });
  }

}
