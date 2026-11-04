// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { InjectionToken } from '@angular/core';

export interface ComnSettingsConfig {
  url: string;
  sharedUrl: string;
  envUrl: string;
}

/**
 * The settings files `ComnSettingsService` reads. Defaults to
 * `assets/config/settings.json`, `settings.shared.json` and `settings.env.json`;
 * pass a config to `ComnSettingsModule.forRoot()` to read others.
 */
export const COMN_SETTINGS_CONFIG: InjectionToken<ComnSettingsConfig> = new InjectionToken<
  ComnSettingsConfig
>('ComnSettingsConfig', {
  providedIn: 'root',
  factory: () => ({
    url: `assets/config/settings.json`,
    sharedUrl: `assets/config/settings.shared.json`,
    envUrl: `assets/config/settings.env.json`,
  }),
});
