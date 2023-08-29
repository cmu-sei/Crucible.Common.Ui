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
import { Observable, fromEvent, interval, merge, Subscription, of, Subject } from 'rxjs';
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
  inactivityTimeSeconds: number = 0;
  timeLapsedSinceInactivity: number = 0;
  kickstartObservable$ = new Subject<boolean>();
  activityObserveable$: Observable<any>;
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
    // get the configured inactivity period
    this.inactivityTimeSeconds =
      this.settingsService.settings.inactivityTimeMinutes ? this.settingsService.settings.inactivityTimeMinutes * 60 : 0;
    // activity events observable
    let observableArray$: Observable<any>[] = [];
    this.inactivityTimerEvent.forEach(x => {
      observableArray$.push(fromEvent(x[0], x[1]))
    });
    observableArray$.push(this.kickstartObservable$);
    this.mergedEventObservable$ = merge(...observableArray$);
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
    // set inactivity and token expiration monitoring
    this.setExpirationTimer();
    this.startInactivityMonitor();
  }

  startInactivityMonitor(): void {
    // No inactivityTimeSeconds means inactivity monitor is disabled
    if (this.inactivityTimeSeconds) {
      this.ngZone.runOutsideAngular(() => {
        this.activityObserveable$ = this.mergedEventObservable$
        .pipe(
          switchMap(ev => interval(1000).pipe(take(this.inactivityTimeSeconds))),
          skipWhile((x) => {
            this.timeLapsedSinceInactivity = x;
            return x != this.inactivityTimeSeconds - 1
          })
        );
        this.subscribeObservable();
        this.kickstartObservable$.next(true);
      });
    }
  }

  subscribeObservable() {
    this.inactivitySubscription = this.activityObserveable$.subscribe((x) => {
      // check for a configured inactivity redirect url
      if (this.settingsService.settings.inactivityRedirectUrl)
      {
        // goto the configured url
        this.inactivitySubscription.unsubscribe();
        document.location.href = this.settingsService.settings.inactivityRedirectUrl;
      }
      else
      {
        // goto the signout redirect page
        this.inactivitySubscription.unsubscribe();
        this.logout();
      }
    });
  }

  setExpirationTimer() {
    // calculate access_token expiration time
    const expirationDate = this.jwtHelper.getTokenExpirationDate(this.user.access_token);
    const currentDate = new Date();
    const expirationMilliseconds = expirationDate.valueOf() - currentDate.valueOf();
    // setup the access token expiration subscription
    this.tokenExpiredSubscription.unsubscribe();
    this.tokenExpiredSubscription = of(null).pipe(delay(expirationMilliseconds)).subscribe((expired) => {
      this.tokenExpiredSubscription.unsubscribe();
      this.inactivitySubscription.unsubscribe();
      this.logout();
    });
  }

}
