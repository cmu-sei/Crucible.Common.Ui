// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { inject, Injectable } from '@angular/core';
import {
  argbFromHex,
  hexFromArgb,
  Hct,
  SchemeTonalSpot,
} from '@material/material-color-utilities';
import type { DynamicScheme } from '@material/material-color-utilities';
import { CRUCIBLE_THEME_CONFIG } from '../models/comn-theme.config';

@Injectable()
export class ComnDynamicThemeService {
  private config = inject(CRUCIBLE_THEME_CONFIG);

  /**
   * Generates Material 3 theme from a hex color using SchemeTonalSpot
   * @param hexColor Source color in hex format (e.g., "#4c7aa2")
   * @returns Object containing light and dark DynamicScheme instances
   */
  generateThemeFromHex(hexColor: string): {
    light: DynamicScheme;
    dark: DynamicScheme;
  } {
    const argb = argbFromHex(hexColor);
    const sourceColorHct = Hct.fromInt(argb);

    return {
      light: new SchemeTonalSpot(sourceColorHct, false, 0),
      dark: new SchemeTonalSpot(sourceColorHct, true, 0),
    };
  }

  /**
   * Applies theme colors to the document (both light and dark)
   * @param hexColor Source color in hex format
   */
  applyThemeToDocument(hexColor: string): void {
    const { light, dark } = this.generateThemeFromHex(hexColor);
    const useExact = this.config.useExactPrimaryColor !== false;
    this.injectLightTheme(light, useExact ? hexColor : undefined);
    this.injectDarkTheme(dark, useExact ? hexColor : undefined);
  }

  /**
   * Applies light theme colors to document root
   * @param hexColor Source color in hex format
   */
  applyLightTheme(hexColor: string): void {
    const { light } = this.generateThemeFromHex(hexColor);
    const useExact = this.config.useExactPrimaryColor !== false;
    this.injectLightTheme(light, useExact ? hexColor : undefined);
  }

  /**
   * Applies dark theme colors to body.darkMode
   * @param hexColor Source color in hex format
   */
  applyDarkTheme(hexColor: string): void {
    const { dark } = this.generateThemeFromHex(hexColor);
    const useExact = this.config.useExactPrimaryColor !== false;
    this.injectDarkTheme(dark, useExact ? hexColor : undefined);
  }

  /**
   * Returns the Material 3 primary color generated from a source hex color
   * @param hexColor Source color in hex format
   * @param isDark Whether to use the dark scheme
   * @returns The computed primary hex color
   */
  getPrimaryColor(hexColor: string, isDark: boolean): string {
    const { light, dark } = this.generateThemeFromHex(hexColor);
    return hexFromArgb(isDark ? dark.primary : light.primary);
  }

  /**
   * Injects light theme CSS variables into :root
   */
  private injectLightTheme(scheme: DynamicScheme, exactPrimaryColor?: string): void {
    const variables = this.buildCssVariables(scheme);

    if (exactPrimaryColor) {
      variables['--mat-sys-primary'] = exactPrimaryColor;
    }

    Object.entries(variables).forEach(([prop, value]) => {
      document.documentElement.style.setProperty(prop, value);
    });
  }

  /**
   * Injects dark theme CSS variables into body.darkMode
   */
  private injectDarkTheme(scheme: DynamicScheme, exactPrimaryColor?: string): void {
    const variables = this.buildCssVariables(scheme);

    if (exactPrimaryColor) {
      variables['--mat-sys-primary'] = exactPrimaryColor;
    }

    let styleElement = document.getElementById('dynamic-dark-theme');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-dark-theme';
      document.head.appendChild(styleElement);
    }

    const cssRules = Object.entries(variables)
      .map(([prop, value]) => `  ${prop}: ${value};`)
      .join('\n');

    styleElement.textContent = `body.darkMode {\n${cssRules}\n}`;
  }

  /**
   * Builds CSS variable object from Material 3 DynamicScheme (44 variables)
   */
  private buildCssVariables(scheme: DynamicScheme): Record<string, string> {
    return {
      // Primary
      '--mat-sys-primary': hexFromArgb(scheme.primary),
      '--mat-sys-on-primary': hexFromArgb(scheme.onPrimary),
      '--mat-sys-primary-container': hexFromArgb(scheme.primaryContainer),
      '--mat-sys-on-primary-container': hexFromArgb(scheme.onPrimaryContainer),
      '--mat-sys-inverse-primary': hexFromArgb(scheme.inversePrimary),

      // Primary Fixed
      '--mat-sys-primary-fixed': hexFromArgb(scheme.primaryFixed),
      '--mat-sys-primary-fixed-dim': hexFromArgb(scheme.primaryFixedDim),
      '--mat-sys-on-primary-fixed': hexFromArgb(scheme.onPrimaryFixed),
      '--mat-sys-on-primary-fixed-variant': hexFromArgb(scheme.onPrimaryFixedVariant),

      // Secondary
      '--mat-sys-secondary': hexFromArgb(scheme.secondary),
      '--mat-sys-on-secondary': hexFromArgb(scheme.onSecondary),
      '--mat-sys-secondary-container': hexFromArgb(scheme.secondaryContainer),
      '--mat-sys-on-secondary-container': hexFromArgb(scheme.onSecondaryContainer),

      // Secondary Fixed
      '--mat-sys-secondary-fixed': hexFromArgb(scheme.secondaryFixed),
      '--mat-sys-secondary-fixed-dim': hexFromArgb(scheme.secondaryFixedDim),
      '--mat-sys-on-secondary-fixed': hexFromArgb(scheme.onSecondaryFixed),
      '--mat-sys-on-secondary-fixed-variant': hexFromArgb(scheme.onSecondaryFixedVariant),

      // Tertiary
      '--mat-sys-tertiary': hexFromArgb(scheme.tertiary),
      '--mat-sys-on-tertiary': hexFromArgb(scheme.onTertiary),
      '--mat-sys-tertiary-container': hexFromArgb(scheme.tertiaryContainer),
      '--mat-sys-on-tertiary-container': hexFromArgb(scheme.onTertiaryContainer),

      // Tertiary Fixed
      '--mat-sys-tertiary-fixed': hexFromArgb(scheme.tertiaryFixed),
      '--mat-sys-tertiary-fixed-dim': hexFromArgb(scheme.tertiaryFixedDim),
      '--mat-sys-on-tertiary-fixed': hexFromArgb(scheme.onTertiaryFixed),
      '--mat-sys-on-tertiary-fixed-variant': hexFromArgb(scheme.onTertiaryFixedVariant),

      // Error
      '--mat-sys-error': hexFromArgb(scheme.error),
      '--mat-sys-on-error': hexFromArgb(scheme.onError),
      '--mat-sys-error-container': hexFromArgb(scheme.errorContainer),
      '--mat-sys-on-error-container': hexFromArgb(scheme.onErrorContainer),

      // Background
      '--mat-sys-background': hexFromArgb(scheme.background),
      '--mat-sys-on-background': hexFromArgb(scheme.onBackground),

      // Surface
      '--mat-sys-surface': hexFromArgb(scheme.surface),
      '--mat-sys-surface-dim': hexFromArgb(scheme.surfaceDim),
      '--mat-sys-surface-bright': hexFromArgb(scheme.surfaceBright),
      '--mat-sys-on-surface': hexFromArgb(scheme.onSurface),
      '--mat-sys-surface-variant': hexFromArgb(scheme.surfaceVariant),
      '--mat-sys-on-surface-variant': hexFromArgb(scheme.onSurfaceVariant),

      // Surface Containers
      '--mat-sys-surface-container-lowest': hexFromArgb(scheme.surfaceContainerLowest),
      '--mat-sys-surface-container-low': hexFromArgb(scheme.surfaceContainerLow),
      '--mat-sys-surface-container': hexFromArgb(scheme.surfaceContainer),
      '--mat-sys-surface-container-high': hexFromArgb(scheme.surfaceContainerHigh),
      '--mat-sys-surface-container-highest': hexFromArgb(scheme.surfaceContainerHighest),

      // Inverse
      '--mat-sys-inverse-surface': hexFromArgb(scheme.inverseSurface),
      '--mat-sys-inverse-on-surface': hexFromArgb(scheme.inverseOnSurface),

      // Outline
      '--mat-sys-outline': hexFromArgb(scheme.outline),
      '--mat-sys-outline-variant': hexFromArgb(scheme.outlineVariant),

      // Shadow, Scrim, and Tint
      '--mat-sys-shadow': hexFromArgb(scheme.shadow),
      '--mat-sys-scrim': hexFromArgb(scheme.scrim),
      '--mat-sys-surface-tint': hexFromArgb(scheme.surfaceTint),
    };
  }
}
