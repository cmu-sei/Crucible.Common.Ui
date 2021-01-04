// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { InjectionToken } from '@angular/core';

export interface ComnSettingsConfig {
  url: string;
  envUrl: string;
}

export const COMN_SETTINGS_CONFIG: InjectionToken<ComnSettingsConfig> = new InjectionToken<
  ComnSettingsConfig
>('ComnSettingsConfig');
