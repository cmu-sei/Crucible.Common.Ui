// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { User } from 'oidc-client-ts';
import { ComnAuthState, Theme } from './comn-auth.model';

/**
 * localStorage key under which the user's theme is kept across reloads. Set
 * it with `provideComnAuthThemeStorage(key)`; without it the theme resets to
 * light on every load.
 */
export const COMN_AUTH_THEME_STORAGE_KEY = new InjectionToken<string>(
  'COMN_AUTH_THEME_STORAGE_KEY'
);

export const authInitialState: ComnAuthState = {
  user: null,
  ui: {
    theme: Theme.LIGHT,
  },
};

@Injectable({ providedIn: 'root' })
export class ComnAuthStore {
  private readonly themeStorageKey = inject(COMN_AUTH_THEME_STORAGE_KEY, {
    optional: true,
  });
  private readonly _state = signal<ComnAuthState>({
    ...authInitialState,
    ui: { theme: this.readTheme() ?? authInitialState.ui.theme },
  });

  readonly state = this._state.asReadonly();

  setUser(user: User): void {
    this._state.update((state) => ({ ...state, user }));
  }

  setTheme(theme: Theme): void {
    this._state.update((state) => ({ ...state, ui: { ...state.ui, theme } }));
    this.writeTheme(theme);
  }

  private readTheme(): Theme | null {
    if (!this.themeStorageKey) {
      return null;
    }
    try {
      const stored = localStorage.getItem(this.themeStorageKey);
      return stored === Theme.LIGHT || stored === Theme.DARK ? stored : null;
    } catch {
      // Storage can be unavailable (privacy mode, sandboxed frame).
      return null;
    }
  }

  private writeTheme(theme: Theme): void {
    if (!this.themeStorageKey) {
      return;
    }
    try {
      localStorage.setItem(this.themeStorageKey, theme);
    } catch {
      // Storage can be unavailable (privacy mode, sandboxed frame).
    }
  }
}
