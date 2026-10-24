// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

/** The landing-background setting an app reads from its settings files. */
export interface CrucibleLandingBackgroundSettings {
  /**
   * URL of the image to show behind an app's landing page. Empty, blank or
   * missing shows no image.
   */
  AppLandingBackgroundImage?: string;
}

/** CSS custom property holding the image's `url(...)` value while it shows. */
export const CRUCIBLE_LANDING_BACKGROUND_PROPERTY = '--crucible-landing-background';

/** Class on the host while the image shows, for styling content over it. */
export const CRUCIBLE_LANDING_BACKGROUND_CLASS = 'crucible-landing-background';

/** Page color under the image in dark mode. */
export const CRUCIBLE_LANDING_BACKGROUND_DARK_COLOR = '#101215';

/** Near-black tint laid over the image in dark mode, so the page stays dark. */
export const CRUCIBLE_LANDING_BACKGROUND_DARK_TINT =
  'linear-gradient(rgba(7, 9, 12, 0.52), rgba(7, 9, 12, 0.44))';
