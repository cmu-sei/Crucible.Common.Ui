// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';
import { User } from 'oidc-client-ts';
import { Theme } from './comn-auth.model';
import { ComnAuthQuery } from './comn-auth.query';
import { ComnAuthStore } from './comn-auth.store';
import { provideComnAuthThemeStorage } from '../provide-comn-auth-theme-storage';

const KEY = 'test-app.theme';

function setup(storageKey?: string) {
  TestBed.configureTestingModule({
    providers: storageKey ? [provideComnAuthThemeStorage(storageKey)] : [],
  });
  return {
    store: TestBed.inject(ComnAuthStore),
    query: TestBed.inject(ComnAuthQuery),
  };
}

describe('ComnAuthStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('starts light with no user', () => {
    const { query } = setup(KEY);

    expect(query.userTheme()).toBe(Theme.LIGHT);
    expect(query.user()).toBeNull();
    expect(query.isLoggedIn()).toBe(false);
  });

  it('restores the theme saved under the configured key', () => {
    localStorage.setItem(KEY, Theme.DARK);

    const { query } = setup(KEY);

    expect(query.userTheme()).toBe(Theme.DARK);
  });

  it('ignores a stored value that is not a theme', () => {
    localStorage.setItem(KEY, '{"auth":{"ui":{"theme":"dark-theme"}}}');

    const { query } = setup(KEY);

    expect(query.userTheme()).toBe(Theme.LIGHT);
  });

  it('saves a theme change under the configured key', () => {
    const { store, query } = setup(KEY);

    store.setTheme(Theme.DARK);

    expect(query.userTheme()).toBe(Theme.DARK);
    expect(localStorage.getItem(KEY)).toBe(Theme.DARK);
  });

  it('neither reads nor writes storage without a key', () => {
    localStorage.setItem(KEY, Theme.DARK);
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    const { store, query } = setup();
    store.setTheme(Theme.DARK);

    expect(query.userTheme()).toBe(Theme.DARK);
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it('keeps the theme when the user changes', () => {
    const { store, query } = setup(KEY);
    store.setTheme(Theme.DARK);

    store.setUser({ access_token: 'token' } as User);

    expect(query.userTheme()).toBe(Theme.DARK);
    expect(query.isLoggedIn()).toBe(true);
  });

  it('emits user changes on user$ after effects flush', () => {
    const { store, query } = setup();
    const seen: (User | null)[] = [];
    query.user$.subscribe((user) => seen.push(user));
    TestBed.tick();

    const user = { access_token: 'token' } as User;
    store.setUser(user);
    TestBed.tick();

    expect(seen).toEqual([null, user]);
  });
});
