// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComnSettingsService } from '../../comn-settings/services/comn-settings.service';
import { CrucibleThemeService } from '../../crucible-theme/services/crucible-theme.service';
import {
  CRUCIBLE_LANDING_BACKGROUND_CLASS,
  CRUCIBLE_LANDING_BACKGROUND_DARK_TINT,
  CRUCIBLE_LANDING_BACKGROUND_PROPERTY,
} from '../models/crucible-landing-background';
import { CrucibleLandingBackgroundDirective } from './crucible-landing-background.directive';

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
    <div id="bound" [crucibleLandingBackground]="show()"></div>
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
    vi.stubGlobal('Image', FakeImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function setup(
    settings: unknown,
    options: { withTheme?: boolean; load?: boolean } = {}
  ): Promise<void> {
    const { withTheme = true, load = true } = options;
    isDarkMode = signal(false);
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: ComnSettingsService, useValue: { settings } },
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
    expect(el().getAttribute('style') ?? '').toBe('');

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
      expect(el(id).getAttribute('style') ?? '').toBe('');
    }
  });

  it('requests the setting image once per host', async () => {
    await setup({ AppLandingBackgroundImage: ` ${IMAGE} ` }, { load: false });

    expect(FakeImage.instances.map((image) => image.src)).toEqual([IMAGE, IMAGE]);
  });

  it('sets nothing until the image loads', async () => {
    await setup({ AppLandingBackgroundImage: IMAGE }, { load: false });
    isDarkMode.set(true);
    await fixture.whenStable();

    expect(el().classList.contains(CRUCIBLE_LANDING_BACKGROUND_CLASS)).toBe(false);
    expect(el().getAttribute('style') ?? '').toBe('');
  });

  it('keeps the host background in either mode when the image fails to load', async () => {
    await setup({ AppLandingBackgroundImage: 'assets/local/missing.jpg' }, { load: false });
    FakeImage.instances.forEach((image) => image.onerror?.());
    isDarkMode.set(true);
    await fixture.whenStable();

    for (const id of ['bound', 'bare']) {
      expect(el(id).classList.contains(CRUCIBLE_LANDING_BACKGROUND_CLASS)).toBe(false);
      expect(el(id).getAttribute('style') ?? '').toBe('');
    }
  });

  it('shows the untinted image when the theme service is not provided', async () => {
    await setup({ AppLandingBackgroundImage: IMAGE }, { withTheme: false });

    expect(style(CRUCIBLE_LANDING_BACKGROUND_PROPERTY)).toBe(URL_VALUE);
    expect(style('background-image')).not.toContain('linear-gradient');
    expect(style('background-color')).toBe('');
  });
});
