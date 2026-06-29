// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { ComnAuthService } from './comn-auth.service';
import { ComnSettingsService } from '../../comn-settings/services/comn-settings.service';

// ComnAuthService builds a real oidc-client-ts UserManager from
// settings.OIDCSettings in its constructor, so a stub settings service must
// supply a minimally-valid OIDCSettings (authority + client_id + redirect_uri).
const settingsStub: Partial<ComnSettingsService> = {
  settings: {
    OIDCSettings: {
      authority: 'https://example.test/auth',
      client_id: 'test-client',
      redirect_uri: 'https://example.test/auth-callback',
    },
  },
};

describe('ComnAuthService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: ComnSettingsService, useValue: settingsStub }],
    }),
  );

  it('should be created', () => {
    const service: ComnAuthService = TestBed.inject(ComnAuthService);
    expect(service).toBeTruthy();
  });
});
