// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CrucibleLandingBackgroundSettings } from './models/crucible-landing-background';

/**
 * The CSS `url(...)` value for `AppLandingBackgroundImage`, or `null` when the
 * setting is empty, blank or missing.
 *
 * The URL is quoted, with backslashes and double quotes escaped and line
 * breaks removed, so any setting value yields one valid CSS `url()`.
 */
export function landingBackgroundImage(
  settings: CrucibleLandingBackgroundSettings | null | undefined
): string | null {
  const url = settings?.AppLandingBackgroundImage;
  if (typeof url !== 'string' || !url.trim()) {
    return null;
  }
  const escaped = url
    .trim()
    .replace(/[\r\n\f]/g, '')
    .replace(/["\\]/g, '\\$&');
  return `url("${escaped}")`;
}
