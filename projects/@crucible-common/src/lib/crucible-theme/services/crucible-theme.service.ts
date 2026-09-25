// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Theme } from '../../comn-auth/state/comn-auth.model';
import { ComnSettingsService } from '../../comn-settings/services/comn-settings.service';
import { CRUCIBLE_THEME_CONFIG } from '../models/crucible-theme.config';
import { applyThemeColors, resolveThemeColors } from '../theme-colors';
import { CrucibleFaviconService } from './crucible-favicon.service';

/**
 * Applies the app's light or dark theme: toggles the `darkMode` class on
 * `body`, sets the top-bar and `primary` CSS custom properties from settings,
 * and recolors the favicon to the top-bar color.
 *
 * Call `applyTheme()` whenever the user's theme changes. Register with
 * `provideCrucibleTheme()`.
 */
@Injectable()
export class CrucibleThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(CRUCIBLE_THEME_CONFIG);
  private readonly settingsService = inject(ComnSettingsService);
  private readonly faviconService = inject(CrucibleFaviconService);

  applyTheme(theme: Theme): void {
    const isDark = theme === Theme.DARK;
    this.document.body.classList.toggle('darkMode', isDark);

    const colors = resolveThemeColors(
      this.settingsService.settings,
      isDark,
      this.config.brand
    );
    applyThemeColors(colors, this.document);
    this.faviconService.updateFavicon(colors.topBarBackground);
  }
}
