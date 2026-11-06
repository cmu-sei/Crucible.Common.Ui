// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ComnAuthStore } from './comn-auth.store';

/**
 * Read side of the auth state. The signals are the source of truth; the `$`
 * observables mirror them through `toObservable`, so they replay the current
 * value to new subscribers and emit changes when Angular flushes effects.
 */
@Injectable({ providedIn: 'root' })
export class ComnAuthQuery {
  private readonly store = inject(ComnAuthStore);

  readonly user = computed(() => this.store.state().user);
  readonly isLoggedIn = computed(() => !!this.user()?.access_token);
  readonly userTheme = computed(() => this.store.state().ui.theme);

  readonly user$ = toObservable(this.user);
  readonly isLoggedIn$ = toObservable(this.isLoggedIn);
  readonly userTheme$ = toObservable(this.userTheme);
}
