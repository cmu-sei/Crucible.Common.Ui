// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  CRUCIBLE_THEME_CONFIG,
  CrucibleThemeConfig,
} from './models/crucible-theme.config';
import { CrucibleFaviconService } from './services/crucible-favicon.service';
import { CrucibleThemeService } from './services/crucible-theme.service';

/**
 * Provides `CrucibleThemeService` and `CrucibleFaviconService`. Works in an
 * NgModule's `providers` or in `bootstrapApplication`:
 *
 * ```ts
 * provideCrucibleTheme({ brand: { color: '#006B6D', text: '#FFFFFF' } }),
 * ```
 */
export function provideCrucibleTheme(
  config: CrucibleThemeConfig
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: CRUCIBLE_THEME_CONFIG, useValue: config },
    CrucibleFaviconService,
    CrucibleThemeService,
  ]);
}
