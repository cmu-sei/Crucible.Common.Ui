// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { InjectionToken } from '@angular/core';

/**
 * Configuration for the Crucible theme system.
 */
export interface CrucibleThemeConfig {
  /** Fallback hex color when AppPrimaryThemeColor is absent from settings. */
  defaultThemeColor?: string;
  /** Path to an SVG asset for favicon coloring. Omit to skip favicon updates. */
  faviconSvgPath?: string;
  /** CSS class in the favicon SVG to apply the fill color to. Defaults to 'cls-1'. */
  faviconFillClass?: string;
  /** Override --mat-sys-primary with the exact hex color instead of Material 3 tone. Defaults to true. */
  useExactPrimaryColor?: boolean;
}

/** Default theme color used when no override is provided. */
export const CRUCIBLE_DEFAULT_THEME_COLOR = '#4c7aa2';

/** Injection token for CrucibleThemeConfig. */
export const CRUCIBLE_THEME_CONFIG = new InjectionToken<CrucibleThemeConfig>(
  'CrucibleThemeConfig'
);

/** Injection token for the favicon SVG asset path. */
export const CRUCIBLE_FAVICON_SVG_PATH = new InjectionToken<string>(
  'CrucibleFaviconSvgPath'
);

/** Injection token for the favicon SVG CSS fill class name. */
export const CRUCIBLE_FAVICON_FILL_CLASS = new InjectionToken<string>(
  'CrucibleFaviconFillClass'
);
