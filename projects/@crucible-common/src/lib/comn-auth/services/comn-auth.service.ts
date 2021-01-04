// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { forwardRef, Inject, Injectable } from '@angular/core';
import {
  Log, User,
  UserManager,
  UserManagerEvents,
  WebStorageStateStore
} from 'oidc-client';
import { ComnSettingsService } from '../../comn-settings/services/comn-settings.service';
import { Theme } from '../state/comn-auth.model';
import { ComnAuthQuery } from '../state/comn-auth.query';
import { ComnAuthStore } from '../state/comn-auth.store';
import UserSignedOutCallback = UserManagerEvents.UserSignedOutCallback;

@Injectable({
  providedIn: 'root',
})
export class ComnAuthService {
  private userManager: UserManager;
  private user: User;
  user$ = this.authQuery.user$;

  constructor(
    @Inject(forwardRef(() => ComnSettingsService))
    private settingsService: ComnSettingsService,
    private store: ComnAuthStore,
    private authQuery: ComnAuthQuery
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
    const userGuid = user.profile.sub;
  }
}
