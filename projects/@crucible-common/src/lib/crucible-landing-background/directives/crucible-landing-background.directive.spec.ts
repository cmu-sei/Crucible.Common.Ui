// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, importProvidersFrom, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComnSettingsModule } from '../../comn-settings/comn-settings.module';
import { ComnSettingsService } from '../../comn-settings/services/comn-settings.service';
import { CrucibleThemeService } from '../../crucible-theme/services/crucible-theme.service';
import {
  CRUCIBLE_LANDING_BACKGROUND_CLASS,
  CRUCIBLE_LANDING_BACKGROUND_DARK_TINT,
  CRUCIBLE_LANDING_BACKGROUND_PROPERTY,
  CRUCIBLE_LANDING_BACKGROUND_SETTINGS,
  CrucibleLandingBackgroundSettings,
} from '../models/crucible-landing-background';
import { CrucibleLandingBackgroundDirective } from './crucible-landing-background.directive';
import { loadedLandingBackgrounds } from './loaded-images';

const IMAGE = 'assets/local/landing.jpg';
const URL_VALUE = `url("${IMAGE}")`;

// The test DOM never loads images, so tests fire load or error themselves.
class FakeImage {
  static instances: FakeImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  constructor() {
    FakeImage.instances.push(this);
  }
}

@Component({
  template: `
    <div id="bound" class="app-home-container" [class.open]="!show()" style="color: red" [crucibleLandingBackground]="show()"></div>
    <div id="bare" crucibleLandingBackground></div>
  `,
  imports: [CrucibleLandingBackgroundDirective],
})
class HostComponent {
  // Signal so a zoneless mutation schedules change detection.
  show = signal(true);
}

describe('CrucibleLandingBackgroundDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let isDarkMode: WritableSignal<boolean>;

  beforeEach(() => {
    FakeImage.instances = [];
    loadedLandingBackgrounds.clear();
    vi.stubGlobal('Image', FakeImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function setup(
    settings: unknown,
    options: { withTheme?: boolean; load?: boolean; comn?: boolean; token?: unknown } = {}
  ): Promise<void> {
    const { withTheme = true, load = true, comn = true, token } = options;
    isDarkMode = signal(false);
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        // comn: the app's loaded ComnSettingsService. Otherwise the real one,
        // never loaded, as in an app with its own settings service.
        ...(comn
          ? [{ provide: ComnSettingsService, useValue: { settings } }]
          : [provideHttpClient(), provideHttpClientTesting()]),
        ...(token !== undefined ? [{ provide: CRUCIBLE_LANDING_BACKGROUND_SETTINGS, useValue: token }] : []),
        ...(withTheme
          ? [{ provide: CrucibleThemeService, useValue: { isDarkMode } }]
          : []),
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    if (load) {
      FakeImage.instances.forEach((image) => image.onload?.());
      await fixture.whenStable();
    }
  }

  function el(id = 'bound'): HTMLElement {
    return fixture.nativeElement.querySelector(`#${id}`);
  }

  function style(name: string, id = 'bound'): string {
    return el(id).style.getPropertyValue(name);
  }

  /** Every inline style the directive could set, ignoring the host's own. */
  function backgroundStyles(id = 'bound'): string {
    return [
      CRUCIBLE_LANDING_BACKGROUND_PROPERTY,
      'background-image',
      'background-color',
      'background-size',
      'background-position',
      'background-attachment',
    ]
      .map((name) => style(name, id))
      .join('');
  }

  it('shows the image, sized to cover, in light mode', async () => {
    await setup({ AppLandingBackgroundImage: IMAGE });

    expect(el().classList.contains(CRUCIBLE_LANDING_BACKGROUND_CLASS)).toBe(true);
    expect(style(CRUCIBLE_LANDING_BACKGROUND_PROPERTY)).toBe(URL_VALUE);
    expect(style('background-image')).toContain(IMAGE);
    expect(style('background-image')).not.toContain('linear-gradient');
    expect(style('background-size')).toBe('cover');
    // jsdom expands the one-value shorthand to both axes.
    expect(style('background-position')).toMatch(/^center( center)?$/);
    expect(style('background-attachment')).toBe('fixed');
    expect(style('background-color')).toBe('');
  });

  it("keeps the host's own classes and styles alongside its bindings", async () => {
    await setup({ AppLandingBackgroundImage: IMAGE });

    expect(el().classList.contains('app-home-container')).toBe(true);
    expect(el().style.color).toBe('red');

    fixture.componentInstance.show.set(false);
    await fixture.whenStable();

    expect(Array.from(el().classList).sort()).toEqual(['app-home-container', 'open']);
    expect(el().style.color).toBe('red');
    expect(style('background-image')).toBe('');
  });

  it('treats the bare attribute as enabled', async () => {
    await setup({ AppLandingBackgroundImage: IMAGE });

    expect(el('bare').classList.contains(CRUCIBLE_LANDING_BACKGROUND_CLASS)).toBe(true);
    expect(style(CRUCIBLE_LANDING_BACKGROUND_PROPERTY, 'bare')).toBe(URL_VALUE);
  });

  it('tints the image and darkens the page in dark mode, following the theme', async () => {
    await setup({ AppLandingBackgroundImage: IMAGE });

    isDarkMode.set(true);
    await fixture.whenStable();

    expect(el().style.backgroundImage).toBe(
      `${CRUCIBLE_LANDING_BACKGROUND_DARK_TINT}, ${URL_VALUE}`
    );
    // #101215, as the browser serializes it.
    expect(el().style.backgroundColor).toBe('rgb(16, 18, 21)');

    isDarkMode.set(false);
    await fixture.whenStable();

    expect(style('background-image')).not.toContain('linear-gradient');
    expect(style('background-color')).toBe('');
  });

  it('sets nothing while the input is false, and restores the image when true', async () => {
    await setup({ AppLandingBackgroundImage: IMAGE });

    fixture.componentInstance.show.set(false);
    await fixture.whenStable();

    expect(el().classList.contains(CRUCIBLE_LANDING_BACKGROUND_CLASS)).toBe(false);
    expect(backgroundStyles()).toBe('');

    fixture.componentInstance.show.set(true);
    await fixture.whenStable();

    expect(el().classList.contains(CRUCIBLE_LANDING_BACKGROUND_CLASS)).toBe(true);
    expect(style(CRUCIBLE_LANDING_BACKGROUND_PROPERTY)).toBe(URL_VALUE);
  });

  it.each([
    ['empty', { AppLandingBackgroundImage: '' }],
    ['missing', {}],
    ['absent settings', undefined],
  ])('sets nothing when the setting is %s, in either mode', async (_label, settings) => {
    await setup(settings);
    isDarkMode.set(true);
    await fixture.whenStable();

    for (const id of ['bound', 'bare']) {
      expect(el(id).classList.contains(CRUCIBLE_LANDING_BACKGROUND_CLASS)).toBe(false);
      expect(backgroundStyles(id)).toBe('');
    }
  });

  it('requests the trimmed setting image for each host', async () => {
    await setup({ AppLandingBackgroundImage: ` ${IMAGE} ` }, { load: false });

    expect(FakeImage.instances.map((image) => image.src)).toEqual([IMAGE, IMAGE]);
  });

  it('sets nothing until the image loads', async () => {
    await setup({ AppLandingBackgroundImage: IMAGE }, { load: false });
    isDarkMode.set(true);
    await fixture.whenStable();

    expect(el().classList.contains(CRUCIBLE_LANDING_BACKGROUND_CLASS)).toBe(false);
    expect(backgroundStyles()).toBe('');
  });

  it('keeps the host background in either mode when the image fails to load', async () => {
    await setup({ AppLandingBackgroundImage: 'assets/local/missing.jpg' }, { load: false });
    expect(FakeImage.instances.every((image) => image.onerror)).toBe(true);
    FakeImage.instances.forEach((image) => image.onerror?.());
    isDarkMode.set(true);
    await fixture.whenStable();

    for (const id of ['bound', 'bare']) {
      expect(el(id).classList.contains(CRUCIBLE_LANDING_BACKGROUND_CLASS)).toBe(false);
      expect(backgroundStyles(id)).toBe('');
    }

    // A failed URL is not remembered as loaded: the next page tries again.
    fixture.destroy();
    TestBed.resetTestingModule();
    FakeImage.instances = [];
    await setup({ AppLandingBackgroundImage: 'assets/local/missing.jpg' }, { load: false });
    expect(FakeImage.instances.map((image) => image.src)).toEqual([
      'assets/local/missing.jpg',
      'assets/local/missing.jpg',
    ]);
  });

  it('shows an image that has loaded once at once on the next page, without loading it again', async () => {
    await setup({ AppLandingBackgroundImage: IMAGE });
    fixture.destroy();
    TestBed.resetTestingModule();
    FakeImage.instances = [];

    await setup({ AppLandingBackgroundImage: IMAGE }, { load: false });

    expect(FakeImage.instances).toEqual([]);
    expect(el().classList.contains(CRUCIBLE_LANDING_BACKGROUND_CLASS)).toBe(true);
    expect(style(CRUCIBLE_LANDING_BACKGROUND_PROPERTY, 'bare')).toBe(URL_VALUE);
  });

  it('abandons the download when the host is destroyed before it loads', async () => {
    await setup({ AppLandingBackgroundImage: IMAGE }, { load: false });
    const pending = [...FakeImage.instances];

    fixture.destroy();

    for (const image of pending) {
      expect(image.onload).toBeNull();
      expect(image.onerror).toBeNull();
      expect(image.src).toBe('');
    }
  });

  it('requests and shows the same cleaned URL', async () => {
    await setup({ AppLandingBackgroundImage: ' assets/local/land\fing.jpg\n' });

    expect(FakeImage.instances.map((image) => image.src)).toEqual([IMAGE, IMAGE]);
    expect(style(CRUCIBLE_LANDING_BACKGROUND_PROPERTY)).toBe(URL_VALUE);
  });

  it('reads the settings token when there is no ComnSettingsService', async () => {
    await setup(undefined, { comn: false, token: { AppLandingBackgroundImage: IMAGE } });

    expect(style(CRUCIBLE_LANDING_BACKGROUND_PROPERTY)).toBe(URL_VALUE);
  });

  it('prefers the settings token over ComnSettingsService', async () => {
    await setup(
      { AppLandingBackgroundImage: 'assets/local/comn.jpg' },
      { token: { AppLandingBackgroundImage: IMAGE } }
    );

    expect(FakeImage.instances.map((image) => image.src)).toEqual([IMAGE, IMAGE]);
  });

  it('sets nothing, without an error, when ComnSettingsService never loaded', async () => {
    await setup(undefined, { comn: false });

    expect(FakeImage.instances).toEqual([]);
    expect(backgroundStyles()).toBe('');
  });

  it('shows the untinted image when the theme service is not provided', async () => {
    await setup({ AppLandingBackgroundImage: IMAGE }, { withTheme: false });

    expect(style(CRUCIBLE_LANDING_BACKGROUND_PROPERTY)).toBe(URL_VALUE);
    expect(style('background-image')).not.toContain('linear-gradient');
    expect(style('background-color')).toBe('');
  });
});

@Component({
  template: `<div id="input" [crucibleLandingBackgroundSettings]="settings()" crucibleLandingBackground></div>`,
  imports: [CrucibleLandingBackgroundDirective],
})
class InputHostComponent {
  settings = signal<CrucibleLandingBackgroundSettings>({ AppLandingBackgroundImage: IMAGE });
}

describe('CrucibleLandingBackgroundDirective settings input', () => {
  beforeEach(() => {
    FakeImage.instances = [];
    loadedLandingBackgrounds.clear();
    vi.stubGlobal('Image', FakeImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefers the input, and loads a new image when it changes', async () => {
    TestBed.configureTestingModule({
      imports: [InputHostComponent],
      providers: [
        { provide: ComnSettingsService, useValue: { settings: { AppLandingBackgroundImage: 'assets/local/comn.jpg' } } },
      ],
    });
    const fixture = TestBed.createComponent(InputHostComponent);
    await fixture.whenStable();
    const host = () => fixture.nativeElement.querySelector('#input') as HTMLElement;

    // the input wins over ComnSettingsService
    expect(FakeImage.instances.map((image) => image.src)).toEqual([IMAGE]);

    // changed while the first is still loading: that download is abandoned
    const first = FakeImage.instances[0];
    fixture.componentInstance.settings.set({ AppLandingBackgroundImage: 'assets/local/other.jpg' });
    await fixture.whenStable();

    expect(first.onload).toBeNull();
    expect(first.src).toBe('');
    expect(FakeImage.instances.map((image) => image.src)).toEqual(['', 'assets/local/other.jpg']);
    expect(host().getAttribute('style') ?? '').toBe('');

    FakeImage.instances[1].onload?.();
    await fixture.whenStable();
    expect(host().style.getPropertyValue(CRUCIBLE_LANDING_BACKGROUND_PROPERTY)).toBe(
      'url("assets/local/other.jpg")'
    );
  });

  it('never creates ComnSettingsService when the input has a value', async () => {
    // An app with its own settings service may have no HTTP providers, so
    // ComnSettingsService (which needs HttpBackend) must not be created.
    TestBed.configureTestingModule({
      imports: [InputHostComponent],
      providers: [
        {
          provide: ComnSettingsService,
          useFactory: () => {
            throw new Error('ComnSettingsService was created');
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(InputHostComponent);
    await fixture.whenStable();

    expect(FakeImage.instances.map((image) => image.src)).toEqual([IMAGE]);
  });
});

describe('CrucibleLandingBackgroundDirective with ComnSettingsModule.forRoot()', () => {
  beforeEach(() => {
    FakeImage.instances = [];
    loadedLandingBackgrounds.clear();
    vi.stubGlobal('Image', FakeImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Every app calls forRoot() with no config, so the directive must not depend
  // on COMN_SETTINGS_CONFIG having a value.
  it('reads ComnSettingsService when forRoot() is given no config', async () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [importProvidersFrom(ComnSettingsModule.forRoot()), provideHttpClientTesting()],
    });
    TestBed.inject(ComnSettingsService).settings = { AppLandingBackgroundImage: IMAGE };
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    expect(FakeImage.instances.map((image) => image.src)).toEqual([IMAGE, IMAGE]);
  });
});
