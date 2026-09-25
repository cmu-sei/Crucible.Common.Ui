// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Theme } from '../../comn-auth/state/comn-auth.model';
import { ComnSettingsService } from '../../comn-settings/services/comn-settings.service';
import {
  CRUCIBLE_THEME_CONFIG,
  CrucibleThemeColorSettings,
  CrucibleThemeConfig,
} from '../models/crucible-theme.config';
import { provideCrucibleTheme } from '../provide-crucible-theme';
import { CrucibleFaviconService } from './crucible-favicon.service';
import { CrucibleThemeService } from './crucible-theme.service';

const BRAND = { color: '#006B6D', text: '#FFFFFF' };
const PROPERTIES = [
  '--app-topbar-background',
  '--app-topbar-text',
  '--mat-sys-primary',
  '--mat-sys-on-primary',
];

function prop(name: string, el: HTMLElement = document.body): string {
  return el.style.getPropertyValue(name);
}

function cleanDom(): void {
  document.body.classList.remove('darkMode');
  for (const el of [document.documentElement, document.body]) {
    for (const name of PROPERTIES) {
      el.style.removeProperty(name);
    }
  }
  document.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove());
}

describe('CrucibleThemeService', () => {
  let updateFavicon: ReturnType<typeof vi.fn>;

  function setup(settings: CrucibleThemeColorSettings | null | undefined): CrucibleThemeService {
    updateFavicon = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: CRUCIBLE_THEME_CONFIG, useValue: { brand: BRAND } },
        { provide: ComnSettingsService, useValue: { settings } },
        { provide: CrucibleFaviconService, useValue: { updateFavicon } },
        CrucibleThemeService,
      ],
    });
    return TestBed.inject(CrucibleThemeService);
  }

  const SETTINGS: CrucibleThemeColorSettings = {
    AppTopBarHexColor: '#111111',
    AppTopBarHexTextColor: '#222222',
    AppLightModePrimaryHexColor: '#333333',
    AppLightModePrimaryHexTextColor: '#444444',
    AppDarkModePrimaryHexColor: '#555555',
    AppDarkModePrimaryHexTextColor: '#666666',
  };

  beforeEach(cleanDom);
  afterEach(cleanDom);

  it('toggles the darkMode class on body', () => {
    const service = setup(SETTINGS);

    service.applyTheme(Theme.DARK);
    expect(document.body.classList.contains('darkMode')).toBe(true);

    service.applyTheme(Theme.LIGHT);
    expect(document.body.classList.contains('darkMode')).toBe(false);
  });

  it('applies the light-mode primary pair and the top-bar pair', () => {
    const service = setup(SETTINGS);

    service.applyTheme(Theme.LIGHT);

    for (const el of [document.documentElement, document.body]) {
      expect(prop('--app-topbar-background', el)).toBe('#111111');
      expect(prop('--app-topbar-text', el)).toBe('#222222');
      expect(prop('--mat-sys-primary', el)).toBe('#333333');
      expect(prop('--mat-sys-on-primary', el)).toBe('#444444');
    }
  });

  it('applies the dark-mode primary pair and keeps the top-bar pair', () => {
    const service = setup(SETTINGS);

    service.applyTheme(Theme.DARK);

    for (const el of [document.documentElement, document.body]) {
      expect(prop('--app-topbar-background', el)).toBe('#111111');
      expect(prop('--app-topbar-text', el)).toBe('#222222');
      expect(prop('--mat-sys-primary', el)).toBe('#555555');
      expect(prop('--mat-sys-on-primary', el)).toBe('#666666');
    }
  });

  it('recolors the favicon with the top-bar background, in both themes', () => {
    const service = setup(SETTINGS);

    service.applyTheme(Theme.LIGHT);
    service.applyTheme(Theme.DARK);

    expect(updateFavicon).toHaveBeenCalledTimes(2);
    expect(updateFavicon).toHaveBeenNthCalledWith(1, '#111111');
    expect(updateFavicon).toHaveBeenNthCalledWith(2, '#111111');
  });

  it.each([{}, null, undefined])('falls back to the configured brand when settings are %s', (settings) => {
    const service = setup(settings as CrucibleThemeColorSettings);

    service.applyTheme(Theme.DARK);

    expect(prop('--app-topbar-background')).toBe(BRAND.color);
    expect(prop('--app-topbar-text')).toBe(BRAND.text);
    expect(prop('--mat-sys-primary')).toBe(BRAND.color);
    expect(prop('--mat-sys-on-primary')).toBe(BRAND.text);
    expect(updateFavicon).toHaveBeenCalledWith(BRAND.color);
  });

  it('reads settings at apply time, not construction time', () => {
    const service = setup({});
    TestBed.inject(ComnSettingsService).settings = { AppTopBarHexColor: '#abcdef' };

    service.applyTheme(Theme.LIGHT);

    expect(prop('--app-topbar-background')).toBe('#abcdef');
    expect(updateFavicon).toHaveBeenCalledWith('#abcdef');
  });
});

describe('provideCrucibleTheme', () => {
  const config: CrucibleThemeConfig = {
    brand: BRAND,
    faviconSvgPath: 'assets/img/logo.svg',
  };

  beforeEach(() => {
    cleanDom();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideCrucibleTheme(config),
        { provide: ComnSettingsService, useValue: { settings: {} } },
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    cleanDom();
  });

  it('provides the config token', () => {
    expect(TestBed.inject(CRUCIBLE_THEME_CONFIG)).toBe(config);
  });

  it('makes both services injectable', () => {
    expect(TestBed.inject(CrucibleThemeService)).toBeInstanceOf(CrucibleThemeService);
    expect(TestBed.inject(CrucibleFaviconService)).toBeInstanceOf(CrucibleFaviconService);
  });

  it('wires the theme service to the real favicon service', () => {
    const httpMock = TestBed.inject(HttpTestingController);

    TestBed.inject(CrucibleThemeService).applyTheme(Theme.LIGHT);
    httpMock
      .expectOne('assets/img/logo.svg')
      .flush('<svg><style>.cls-1{fill:#000;}</style></svg>');

    const href = document
      .querySelector<HTMLLinkElement>('link[rel~="icon"]')!
      .getAttribute('href')!;
    expect(decodeURIComponent(href)).toContain(`.cls-1{fill:${BRAND.color};}`);
    expect(prop('--mat-sys-primary')).toBe(BRAND.color);
  });
});
