// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Store, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { ComnAuthState, Theme } from './comn-auth.model';

export const authInitialState: ComnAuthState = {
  user: null,
  ui: {
    theme: Theme.LIGHT,
  },
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth', resettable: true })
export class ComnAuthStore extends Store<ComnAuthState> {
  constructor() {
    super(authInitialState);
  }
}
