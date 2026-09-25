// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import {
  CrucibleBrandColors,
  CrucibleResolvedThemeColors,
  CrucibleThemeColorSettings,
} from './models/crucible-theme.config';
import {
  applyThemeColors,
  CRUCIBLE_TOPBAR_BACKGROUND_PROPERTY,
  CRUCIBLE_TOPBAR_TEXT_PROPERTY,
  resolveThemeColors,
} from './theme-colors';

const BRAND: CrucibleBrandColors = { color: '#006B6D', text: '#FFFFFF' };

const ALL_SIX: CrucibleThemeColorSettings = {
  AppTopBarHexColor: '#111111',
  AppTopBarHexTextColor: '#222222',
  AppLightModePrimaryHexColor: '#333333',
  AppLightModePrimaryHexTextColor: '#444444',
  AppDarkModePrimaryHexColor: '#555555',
  AppDarkModePrimaryHexTextColor: '#666666',
};

describe('resolveThemeColors', () => {
  it('uses all six keys as given in light mode', () => {
    expect(resolveThemeColors(ALL_SIX, false, BRAND)).toEqual({
      topBarBackground: '#111111',
      topBarText: '#222222',
      primary: '#333333',
      onPrimary: '#444444',
    });
  });

  it('uses all six keys as given in dark mode', () => {
    expect(resolveThemeColors(ALL_SIX, true, BRAND)).toEqual({
      topBarBackground: '#111111',
      topBarText: '#222222',
      primary: '#555555',
      onPrimary: '#666666',
    });
  });

  it('falls back from dark primary color to light primary color', () => {
    const { AppDarkModePrimaryHexColor, ...settings } = ALL_SIX;
    const colors = resolveThemeColors(settings, true, BRAND);
    expect(colors.primary).toBe('#333333');
    // The text key is resolved independently and is still present.
    expect(colors.onPrimary).toBe('#666666');
  });

  it('falls back from dark primary text to light primary text', () => {
    const { AppDarkModePrimaryHexTextColor, ...settings } = ALL_SIX;
    const colors = resolveThemeColors(settings, true, BRAND);
    expect(colors.primary).toBe('#555555');
    expect(colors.onPrimary).toBe('#444444');
  });

  it('falls back through light keys to brand when dark and light keys are missing', () => {
    const colors = resolveThemeColors(
      { AppTopBarHexColor: '#111111', AppTopBarHexTextColor: '#222222' },
      true,
      BRAND
    );
    expect(colors.primary).toBe(BRAND.color);
    expect(colors.onPrimary).toBe(BRAND.text);
  });

  it('falls back to brand for missing top-bar keys', () => {
    const { AppTopBarHexColor, AppTopBarHexTextColor, ...settings } = ALL_SIX;
    for (const isDark of [false, true]) {
      const colors = resolveThemeColors(settings, isDark, BRAND);
      expect(colors.topBarBackground).toBe(BRAND.color);
      expect(colors.topBarText).toBe(BRAND.text);
    }
  });

  it('falls back to brand for missing light-mode keys', () => {
    const colors = resolveThemeColors(
      { AppDarkModePrimaryHexColor: '#555555' },
      false,
      BRAND
    );
    expect(colors.primary).toBe(BRAND.color);
    expect(colors.onPrimary).toBe(BRAND.text);
  });

  it('never lets top-bar keys affect primary', () => {
    const settings = {
      AppTopBarHexColor: '#111111',
      AppTopBarHexTextColor: '#222222',
    };
    for (const isDark of [false, true]) {
      const colors = resolveThemeColors(settings, isDark, BRAND);
      expect(colors.primary).toBe(BRAND.color);
      expect(colors.onPrimary).toBe(BRAND.text);
    }
  });

  it('never lets primary keys affect the top bar', () => {
    const { AppTopBarHexColor, AppTopBarHexTextColor, ...settings } = ALL_SIX;
    for (const isDark of [false, true]) {
      const colors = resolveThemeColors(settings, isDark, BRAND);
      expect(colors.topBarBackground).toBe(BRAND.color);
      expect(colors.topBarText).toBe(BRAND.text);
    }
  });

  it.each([null, undefined])('uses brand for everything when settings are %s', (settings) => {
    for (const isDark of [false, true]) {
      expect(resolveThemeColors(settings, isDark, BRAND)).toEqual({
        topBarBackground: BRAND.color,
        topBarText: BRAND.text,
        primary: BRAND.color,
        onPrimary: BRAND.text,
      });
    }
  });

  it('uses brand for everything when settings are empty', () => {
    expect(resolveThemeColors({}, true, BRAND)).toEqual({
      topBarBackground: BRAND.color,
      topBarText: BRAND.text,
      primary: BRAND.color,
      onPrimary: BRAND.text,
    });
  });

  it('treats empty strings as missing', () => {
    const empty: CrucibleThemeColorSettings = {
      AppTopBarHexColor: '',
      AppTopBarHexTextColor: '',
      AppLightModePrimaryHexColor: '#333333',
      AppLightModePrimaryHexTextColor: '#444444',
      AppDarkModePrimaryHexColor: '',
      AppDarkModePrimaryHexTextColor: '',
    };
    expect(resolveThemeColors(empty, true, BRAND)).toEqual({
      topBarBackground: BRAND.color,
      topBarText: BRAND.text,
      primary: '#333333',
      onPrimary: '#444444',
    });
    expect(
      resolveThemeColors(
        { AppLightModePrimaryHexColor: '', AppLightModePrimaryHexTextColor: '' },
        false,
        BRAND
      )
    ).toEqual({
      topBarBackground: BRAND.color,
      topBarText: BRAND.text,
      primary: BRAND.color,
      onPrimary: BRAND.text,
    });
  });

  it('passes values through unchanged, even low-contrast overrides', () => {
    // Dark-on-dark with non-normalized casing/format: must not be corrected (spec §5).
    const settings: CrucibleThemeColorSettings = {
      AppTopBarHexColor: '#fefefe',
      AppTopBarHexTextColor: '#FFFFFF',
      AppLightModePrimaryHexColor: '#ffff00',
      AppLightModePrimaryHexTextColor: '#FFFFFE',
      AppDarkModePrimaryHexColor: '#000001',
      AppDarkModePrimaryHexTextColor: '#000000',
    };
    expect(resolveThemeColors(settings, false, BRAND)).toEqual({
      topBarBackground: '#fefefe',
      topBarText: '#FFFFFF',
      primary: '#ffff00',
      onPrimary: '#FFFFFE',
    });
    expect(resolveThemeColors(settings, true, BRAND)).toEqual({
      topBarBackground: '#fefefe',
      topBarText: '#FFFFFF',
      primary: '#000001',
      onPrimary: '#000000',
    });
  });

  it('does not derive a dark-mode primary from the light-mode override', () => {
    const colors = resolveThemeColors(
      { AppLightModePrimaryHexColor: '#123456' },
      true,
      BRAND
    );
    expect(colors.primary).toBe('#123456');
  });
});

describe('applyThemeColors', () => {
  const PROPERTIES = [
    CRUCIBLE_TOPBAR_BACKGROUND_PROPERTY,
    CRUCIBLE_TOPBAR_TEXT_PROPERTY,
    '--mat-sys-primary',
    '--mat-sys-on-primary',
  ];

  afterEach(() => {
    for (const el of [document.documentElement, document.body]) {
      for (const name of PROPERTIES) {
        el.style.removeProperty(name);
      }
    }
  });

  it('uses the expected property names', () => {
    expect(CRUCIBLE_TOPBAR_BACKGROUND_PROPERTY).toBe('--app-topbar-background');
    expect(CRUCIBLE_TOPBAR_TEXT_PROPERTY).toBe('--app-topbar-text');
  });

  it('sets all four properties on documentElement and body', () => {
    const colors: CrucibleResolvedThemeColors = {
      topBarBackground: '#111111',
      topBarText: '#222222',
      primary: '#333333',
      onPrimary: '#444444',
    };
    applyThemeColors(colors, document);

    for (const el of [document.documentElement, document.body]) {
      expect(el.style.getPropertyValue('--app-topbar-background')).toBe('#111111');
      expect(el.style.getPropertyValue('--app-topbar-text')).toBe('#222222');
      expect(el.style.getPropertyValue('--mat-sys-primary')).toBe('#333333');
      expect(el.style.getPropertyValue('--mat-sys-on-primary')).toBe('#444444');
    }
  });

  it('overwrites previously applied values', () => {
    applyThemeColors(
      { topBarBackground: '#1', topBarText: '#2', primary: '#3', onPrimary: '#4' },
      document
    );
    applyThemeColors(
      { topBarBackground: '#aaaaaa', topBarText: '#bbbbbb', primary: '#cccccc', onPrimary: '#dddddd' },
      document
    );
    for (const el of [document.documentElement, document.body]) {
      expect(el.style.getPropertyValue('--mat-sys-primary')).toBe('#cccccc');
      expect(el.style.getPropertyValue('--app-topbar-background')).toBe('#aaaaaa');
    }
  });
});
