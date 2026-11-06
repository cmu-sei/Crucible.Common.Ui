// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { COMN_AUTH_THEME_STORAGE_KEY } from './state/comn-auth.store';

/**
 * Keeps the user's theme in localStorage under `key` across reloads. Use a key
 * unique to the app: apps served from the same origin share localStorage.
 * Works in an NgModule's `providers` or in `bootstrapApplication`:
 *
 * ```ts
 * provideComnAuthThemeStorage('player-ui.theme'),
 * ```
 */
export function provideComnAuthThemeStorage(key: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: COMN_AUTH_THEME_STORAGE_KEY, useValue: key },
  ]);
}
