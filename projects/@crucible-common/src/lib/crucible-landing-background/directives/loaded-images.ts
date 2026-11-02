// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

/**
 * URLs that have loaded, shared by every directive instance, so returning to a
 * landing page shows its image at once rather than waiting on a fresh load.
 * Not exported from the library.
 */
export const loadedLandingBackgrounds = new Set<string>();
