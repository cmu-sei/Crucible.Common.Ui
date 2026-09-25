// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { InjectionToken } from '@angular/core';

/**
 * The color settings an app reads from its `settings.json`. All fields are
 * optional. See the Crucible colors design specification (§4) for the contract.
 */
export interface CrucibleThemeColorSettings {
  /** Top bar background, in both themes. */
  AppTopBarHexColor?: string;
  /** Text/icon color on the top bar, in both themes. */
  AppTopBarHexTextColor?: string;
  /** `primary` in light mode. */
  AppLightModePrimaryHexColor?: string;
  /** `on-primary` in light mode. */
  AppLightModePrimaryHexTextColor?: string;
  /** `primary` in dark mode. Falls back to `AppLightModePrimaryHexColor`. */
  AppDarkModePrimaryHexColor?: string;
  /** `on-primary` in dark mode. Falls back to `AppLightModePrimaryHexTextColor`. */
  AppDarkModePrimaryHexTextColor?: string;
}

/**
 * An app's brand color pair (spec §2). Used when a top-bar or light-mode
 * setting is absent.
 */
export interface CrucibleBrandColors {
  /** The brand color, e.g. `'#006B6D'`. */
  color: string;
  /** Text on the brand color, e.g. `'#FFFFFF'`. */
  text: string;
}

/** The resolved colors, one per CSS custom property the theme sets. */
export interface CrucibleResolvedThemeColors {
  /** `--crucible-topbar-background` */
  topBarBackground: string;
  /** `--crucible-topbar-text` */
  topBarText: string;
  /** `--mat-sys-primary` */
  primary: string;
  /** `--mat-sys-on-primary` */
  onPrimary: string;
}

/** Configuration for `provideCrucibleTheme()`. */
export interface CrucibleThemeConfig {
  /** The app's brand color pair from spec §2. */
  brand: CrucibleBrandColors;
  /**
   * Path to the SVG to recolor as the favicon. Defaults to the `href` of the
   * page's `<link rel="icon">` when that link is an SVG. The favicon is left
   * alone when neither is an SVG.
   */
  faviconSvgPath?: string;
  /** CSS class in the favicon SVG to apply the fill color to. Defaults to `'cls-1'`. */
  faviconFillClass?: string;
}

/** Injection token for `CrucibleThemeConfig`. */
export const CRUCIBLE_THEME_CONFIG = new InjectionToken<CrucibleThemeConfig>(
  'CrucibleThemeConfig'
);
