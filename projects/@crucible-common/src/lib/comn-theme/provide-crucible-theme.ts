// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import {
  APP_INITIALIZER,
  Provider,
} from '@angular/core';
import {
  CrucibleThemeConfig,
  CRUCIBLE_THEME_CONFIG,
  CRUCIBLE_FAVICON_SVG_PATH,
  CRUCIBLE_FAVICON_FILL_CLASS,
  CRUCIBLE_DEFAULT_THEME_COLOR,
} from './models/comn-theme.config';
import { ComnSettingsService } from '../comn-settings';
import { ComnDynamicThemeService } from './services/dynamic-theme.service';
import { ComnFaviconService } from './services/favicon.service';

/**
 * Provides all Crucible theme-related services and initializers.
 *
 * Usage in app.module.ts providers:
 * ```
 * ...provideCrucibleTheme({
 *   defaultThemeColor: '#008740',
 *   faviconSvgPath: 'assets/svg-icons/crucible-icon-gallery.svg',
 * }),
 * ```
 */
export function provideCrucibleTheme(
  config: CrucibleThemeConfig = {}
): Provider[] {
  const providers: Provider[] = [
    { provide: CRUCIBLE_THEME_CONFIG, useValue: config },
    ComnDynamicThemeService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (
        settingsService: ComnSettingsService,
        themeService: ComnDynamicThemeService
      ) => {
        return () => {
          const hexColor =
            settingsService.settings.AppPrimaryThemeColor ||
            config.defaultThemeColor ||
            CRUCIBLE_DEFAULT_THEME_COLOR;
          themeService.applyThemeToDocument(hexColor);
        };
      },
      deps: [ComnSettingsService, ComnDynamicThemeService],
    },
  ];

  if (config.faviconSvgPath) {
    providers.push(
      { provide: CRUCIBLE_FAVICON_SVG_PATH, useValue: config.faviconSvgPath },
      { provide: CRUCIBLE_FAVICON_FILL_CLASS, useValue: config.faviconFillClass || 'cls-1' },
      ComnFaviconService
    );
  }

  return providers;
}
