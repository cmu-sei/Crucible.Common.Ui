// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Query } from '@datorama/akita';
import { ComnAuthStore } from './comn-auth.store';
import { ComnAuthState } from './comn-auth.model';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ComnAuthQuery extends Query<ComnAuthState> {
  isLoggedIn$ = this.select(
    (state) => !!state.user && !!state.user.access_token
  );
  user$ = this.select((state) => state.user);
  userTheme$ = this.select((state) => state.ui.theme);

  constructor(protected store: ComnAuthStore) {
    super(store);
  }
}
