// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { booleanAttribute, computed, Directive, inject, input, signal } from '@angular/core';
import { ComnSettingsService } from '../../comn-settings/services/comn-settings.service';
import { CrucibleThemeService } from '../../crucible-theme/services/crucible-theme.service';
import { landingBackgroundImage } from '../landing-background';
import {
  CRUCIBLE_LANDING_BACKGROUND_DARK_COLOR,
  CRUCIBLE_LANDING_BACKGROUND_DARK_TINT,
  CrucibleLandingBackgroundSettings,
} from '../models/crucible-landing-background';

/**
 * Shows the `AppLandingBackgroundImage` setting behind the host element, sized
 * to cover it. In dark mode, as reported by `CrucibleThemeService.isDarkMode`,
 * a near-black tint goes over the image so the page stays dark.
 *
 * ```html
 * <div class="app-home-container" [crucibleLandingBackground]="!exhibitId">
 * ```
 *
 * Bind `false` to hide the image, e.g. while an item is open. The bare
 * attribute means `true`. While the image shows, the host gets the
 * `crucible-landing-background` class and the `--crucible-landing-background`
 * custom property, so the app can give content over the image a solid surface.
 * The image shows only once it loads. When the setting is empty, the image
 * fails to load, or the input is `false`, the directive sets nothing, so the
 * host keeps its own background.
 */
@Directive({
  selector: '[crucibleLandingBackground]',
  host: {
    '[class.crucible-landing-background]': 'image() !== null',
    '[style.--crucible-landing-background]': 'image()',
    '[style.background-image]': 'backgroundImage()',
    '[style.background-color]': 'backgroundColor()',
    '[style.background-size]': 'image() ? "cover" : null',
    '[style.background-position]': 'image() ? "center" : null',
    // Pinned to the window, so the image sits in the same place in every app
    // whatever the height of its top bar or page.
    '[style.background-attachment]': 'image() ? "fixed" : null',
  },
})
export class CrucibleLandingBackgroundDirective {
  private readonly themeService = inject(CrucibleThemeService, { optional: true });
  private readonly settings: CrucibleLandingBackgroundSettings | undefined =
    inject(ComnSettingsService).settings;

  /** The setting's CSS `url(...)` value, once the image has loaded. */
  private readonly loadedImage = signal<string | null>(null);

  constructor() {
    const image = landingBackgroundImage(this.settings);
    if (image && typeof Image !== 'undefined') {
      const loader = new Image();
      loader.onload = () => this.loadedImage.set(image);
      loader.src = this.settings!.AppLandingBackgroundImage!.trim();
    }
  }

  /** Whether to show the image. Defaults to `true`. */
  readonly enabled = input(true, {
    alias: 'crucibleLandingBackground',
    transform: booleanAttribute,
  });

  /** The image's CSS `url(...)` value while it shows, otherwise `null`. */
  protected readonly image = computed(() =>
    this.enabled() ? this.loadedImage() : null
  );

  private readonly isDark = computed(
    () => this.themeService?.isDarkMode() ?? false
  );

  protected readonly backgroundImage = computed(() => {
    const image = this.image();
    if (!image) {
      return null;
    }
    return this.isDark() ? `${CRUCIBLE_LANDING_BACKGROUND_DARK_TINT}, ${image}` : image;
  });

  protected readonly backgroundColor = computed(() =>
    this.image() && this.isDark() ? CRUCIBLE_LANDING_BACKGROUND_DARK_COLOR : null
  );
}
