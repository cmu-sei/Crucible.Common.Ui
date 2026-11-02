// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { COMN_SETTINGS_CONFIG } from '../../comn-settings/models/comn-settings';
import { ComnSettingsService } from '../../comn-settings/services/comn-settings.service';
import { CrucibleThemeService } from '../../crucible-theme/services/crucible-theme.service';
import { cssUrl, landingBackgroundUrl } from '../landing-background';
import {
  CRUCIBLE_LANDING_BACKGROUND_CLASS,
  CRUCIBLE_LANDING_BACKGROUND_DARK_COLOR,
  CRUCIBLE_LANDING_BACKGROUND_DARK_TINT,
  CRUCIBLE_LANDING_BACKGROUND_PROPERTY,
  CRUCIBLE_LANDING_BACKGROUND_SETTINGS,
  CrucibleLandingBackgroundSettings,
} from '../models/crucible-landing-background';
import { loadedLandingBackgrounds } from './loaded-images';

/**
 * Shows the `AppLandingBackgroundImage` setting behind the host element. The
 * image is pinned to the window (`background-attachment: fixed`), so `cover`
 * sizes it to the viewport, not the host, and it sits in the same place in
 * every app whatever the height of its top bar. iOS Safari ignores `fixed` and
 * scrolls the image with the host instead. In dark mode, as reported by
 * `CrucibleThemeService.isDarkMode`, a near-black tint goes over the image so
 * the page stays dark.
 *
 * ```html
 * <div class="app-home-container" [crucibleLandingBackground]="!exhibitId">
 * ```
 *
 * Bind `false` to hide the image, e.g. while an item is open. The bare
 * attribute means `true`. While the image shows, the host gets the
 * `crucible-landing-background` class and the `--crucible-landing-background`
 * custom property, so the app can give content over the image a solid surface.
 *
 * The setting comes from the `crucibleLandingBackgroundSettings` input, else
 * `CRUCIBLE_LANDING_BACKGROUND_SETTINGS`, else `ComnSettingsService` when the
 * app configured it with `COMN_SETTINGS_CONFIG`. With none of them, the
 * directive sets nothing.
 *
 * The image shows only once it loads; after that, every instance shows it at
 * once. When the setting is empty, the image fails to load, or the input is
 * `false`, the directive sets nothing, so the host keeps its own background.
 * The load check and the background are separate requests, so a server that
 * sends `Cache-Control: no-store` serves the image twice.
 */
@Directive({
  selector: '[crucibleLandingBackground]',
  host: {
    '[class]': 'hostClass()',
    '[style]': 'hostStyle()',
  },
})
export class CrucibleLandingBackgroundDirective {
  private readonly themeService = inject(CrucibleThemeService, { optional: true });
  private readonly provided = inject(CRUCIBLE_LANDING_BACKGROUND_SETTINGS, { optional: true });
  // ComnSettingsService is provided in root, so it always injects, but an app
  // that never configured it (TopoMojo, Gameboard) never loads its settings.
  // Only read it when it was configured.
  private readonly comnSettings = inject(COMN_SETTINGS_CONFIG, { optional: true })
    ? inject(ComnSettingsService)
    : null;

  /** Whether to show the image. Defaults to `true`. */
  readonly enabled = input(true, {
    alias: 'crucibleLandingBackground',
    transform: booleanAttribute,
  });

  /** Settings to read the image from, for an app with its own settings service. */
  readonly settings = input<CrucibleLandingBackgroundSettings | null | undefined>(
    undefined,
    { alias: 'crucibleLandingBackgroundSettings' }
  );

  private readonly url = computed(() =>
    landingBackgroundUrl(this.settings() ?? this.provided ?? this.comnSettings?.settings)
  );

  /** The URL this instance has seen load; with the shared set, whether it has loaded. */
  private readonly loadedUrl = signal<string | null>(null);

  /** The image's CSS `url(...)` value while it shows, otherwise `null`. */
  protected readonly image = computed(() => {
    const url = this.url();
    const loaded = url !== null && (this.loadedUrl() === url || loadedLandingBackgrounds.has(url));
    return this.enabled() && loaded ? cssUrl(url) : null;
  });

  private readonly isDark = computed(() => this.themeService?.isDarkMode() ?? false);

  protected readonly hostClass = computed(() => ({
    [CRUCIBLE_LANDING_BACKGROUND_CLASS]: this.image() !== null,
  }));

  protected readonly hostStyle = computed(() => {
    const image = this.image();
    if (!image) {
      return null;
    }
    const dark = this.isDark();
    return {
      [CRUCIBLE_LANDING_BACKGROUND_PROPERTY]: image,
      'background-image': dark ? `${CRUCIBLE_LANDING_BACKGROUND_DARK_TINT}, ${image}` : image,
      'background-color': dark ? CRUCIBLE_LANDING_BACKGROUND_DARK_COLOR : null,
      'background-size': 'cover',
      'background-position': 'center',
      'background-attachment': 'fixed',
    };
  });

  constructor() {
    let loader: HTMLImageElement | null = null;
    const stop = () => {
      if (loader) {
        loader.onload = null;
        loader.onerror = null;
        // Abandons the download, so nothing holds on to this instance.
        loader.src = '';
        loader = null;
      }
    };

    effect(() => {
      const url = this.url();
      stop();
      if (url === null || loadedLandingBackgrounds.has(url) || typeof Image === 'undefined') {
        return;
      }
      const image = new Image();
      image.onload = () => {
        loadedLandingBackgrounds.add(url);
        loader = null;
        this.loadedUrl.set(url);
      };
      // A failed URL is not remembered, so the host keeps its own background.
      image.onerror = () => {
        loader = null;
      };
      image.src = url;
      loader = image;
    });

    inject(DestroyRef).onDestroy(stop);
  }
}
