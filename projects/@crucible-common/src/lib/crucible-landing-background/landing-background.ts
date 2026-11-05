// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CrucibleLandingBackgroundSettings } from './models/crucible-landing-background';

/**
 * The URL in `AppLandingBackgroundImage`, trimmed and with line breaks and form
 * feeds removed, or `null` when the setting is empty, blank or missing. This is
 * the URL both requested and shown, so the two never differ.
 */
export function landingBackgroundUrl(
  settings: CrucibleLandingBackgroundSettings | null | undefined
): string | null {
  const url = settings?.AppLandingBackgroundImage;
  if (typeof url !== 'string') {
    return null;
  }
  const cleaned = url.trim().replace(/[\r\n\f]/g, '');
  return cleaned || null;
}

/**
 * The CSS `url(...)` value for `AppLandingBackgroundImage`, or `null` when the
 * setting is empty, blank or missing.
 *
 * The URL is {@link landingBackgroundUrl}, quoted, with backslashes and double
 * quotes escaped, so any setting value yields one valid CSS `url()`.
 */
export function landingBackgroundImage(
  settings: CrucibleLandingBackgroundSettings | null | undefined
): string | null {
  const url = landingBackgroundUrl(settings);
  return url === null ? null : cssUrl(url);
}

/** A cleaned URL as a quoted CSS `url()`. */
export function cssUrl(url: string): string {
  return `url("${url.replace(/["\\]/g, '\\$&')}")`;
}
