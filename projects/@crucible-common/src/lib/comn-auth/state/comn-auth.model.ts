// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { User } from 'oidc-client-ts';

export const enum Theme {
  LIGHT = 'light-theme',
  DARK = 'dark-theme',
}

export interface ComnAuthState {
  user: User;
  ui: {
    theme: Theme;
  };
}
