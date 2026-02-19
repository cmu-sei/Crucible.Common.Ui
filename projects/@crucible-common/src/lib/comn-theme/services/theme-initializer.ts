// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { inject } from '@angular/core';
import { ComnSettingsService } from '../../comn-settings';
import { ComnDynamicThemeService } from './dynamic-theme.service';
import {
  CRUCIBLE_DEFAULT_THEME_COLOR,
  CRUCIBLE_THEME_CONFIG,
} from '../models/comn-theme.config';

/**
 * App initializer function that applies the Crucible theme at startup.
 * Compatible with provideAppInitializer().
 */
export function crucibleThemeInitializer(): void {
  const settingsService = inject(ComnSettingsService);
  const themeService = inject(ComnDynamicThemeService);
  const config = inject(CRUCIBLE_THEME_CONFIG);

  const hexColor =
    settingsService.settings.AppPrimaryThemeColor ||
    config.defaultThemeColor ||
    CRUCIBLE_DEFAULT_THEME_COLOR;

  themeService.applyThemeToDocument(hexColor);
}
