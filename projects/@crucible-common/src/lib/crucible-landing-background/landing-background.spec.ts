// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { landingBackgroundImage } from './landing-background';

describe('landingBackgroundImage', () => {
  it('wraps the setting in a quoted CSS url()', () => {
    expect(
      landingBackgroundImage({ AppLandingBackgroundImage: 'assets/local/landing.jpg' })
    ).toBe('url("assets/local/landing.jpg")');
  });

  it('trims surrounding whitespace', () => {
    expect(
      landingBackgroundImage({ AppLandingBackgroundImage: '  https://example.com/a.jpg \n' })
    ).toBe('url("https://example.com/a.jpg")');
  });

  it('escapes quotes and backslashes and drops line breaks', () => {
    expect(
      landingBackgroundImage({ AppLandingBackgroundImage: 'a"b\\c\nd' })
    ).toBe('url("a\\"b\\\\cd")');
  });

  it.each([
    ['an empty string', { AppLandingBackgroundImage: '' }],
    ['a blank string', { AppLandingBackgroundImage: '   ' }],
    ['a missing key', {}],
    ['a non-string value', { AppLandingBackgroundImage: 42 as unknown as string }],
    ['null settings', null],
    ['undefined settings', undefined],
  ])('returns null for %s', (_label, settings) => {
    expect(landingBackgroundImage(settings)).toBeNull();
  });
});
