// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

/**
 * Resolves an app's color settings into the CSS custom properties the theme
 * paints with, and applies them. Implements the Crucible colors design
 * specification (`design-specs/angular/colors.md`).
 *
 * Framework-agnostic on purpose: no Angular imports, and the only DOM access is
 * through a `Document` handed in by the caller.
 *
 * ## Why the top bar and `primary` are separate settings
 *
 * The top bar shows the brand color in both themes. Material's `primary` role,
 * however, also colors text buttons, links, outlines and action icons drawn
 * directly on the surface, and a brand color chosen to carry white top-bar text
 * is too dark to meet WCAG 2.1 AA against the dark surface. So the top bar,
 * light-mode `primary` and dark-mode `primary` are each configured by their own
 * pair of keys.
 *
 * Every value is used exactly as given. Nothing here checks contrast, corrects,
 * clamps or derives a color: an operator who overrides a color owns its
 * accessibility compliance (spec §5).
 */

import {
  CrucibleBrandColors,
  CrucibleResolvedThemeColors,
  CrucibleThemeColorSettings,
} from './models/crucible-theme.config';

/** CSS custom property for the top-bar background. */
export const CRUCIBLE_TOPBAR_BACKGROUND_PROPERTY = '--crucible-topbar-background';

/** CSS custom property for text and icons on the top bar. */
export const CRUCIBLE_TOPBAR_TEXT_PROPERTY = '--crucible-topbar-text';

/**
 * Resolve the colors for one theme. Each value is resolved independently: the
 * top-bar keys never affect `primary`, and the `primary` keys never affect the
 * top bar. A missing dark-mode key falls back to its light-mode counterpart; a
 * missing top-bar or light-mode key falls back to the app's brand pair.
 */
export function resolveThemeColors(
  settings: CrucibleThemeColorSettings | null | undefined,
  isDark: boolean,
  brand: CrucibleBrandColors
): CrucibleResolvedThemeColors {
  const lightPrimary = settings?.AppLightModePrimaryHexColor || brand.color;
  const lightOnPrimary =
    settings?.AppLightModePrimaryHexTextColor || brand.text;

  return {
    topBarBackground: settings?.AppTopBarHexColor || brand.color,
    topBarText: settings?.AppTopBarHexTextColor || brand.text,
    primary: isDark
      ? settings?.AppDarkModePrimaryHexColor || lightPrimary
      : lightPrimary,
    onPrimary: isDark
      ? settings?.AppDarkModePrimaryHexTextColor || lightOnPrimary
      : lightOnPrimary,
  };
}

/**
 * Write the resolved colors onto `doc` as CSS custom properties.
 *
 * Sets each property on both `documentElement` and `body`: Material components
 * resolve `--mat-sys-*` from whichever is nearer, and apps toggle the
 * `darkMode` class on `body`.
 */
export function applyThemeColors(
  colors: CrucibleResolvedThemeColors,
  doc: Document
): void {
  const properties: [string, string][] = [
    [CRUCIBLE_TOPBAR_BACKGROUND_PROPERTY, colors.topBarBackground],
    [CRUCIBLE_TOPBAR_TEXT_PROPERTY, colors.topBarText],
    ['--mat-sys-primary', colors.primary],
    ['--mat-sys-on-primary', colors.onPrimary],
  ];

  for (const target of [doc.documentElement.style, doc.body.style]) {
    for (const [name, value] of properties) {
      target.setProperty(name, value);
    }
  }
}
