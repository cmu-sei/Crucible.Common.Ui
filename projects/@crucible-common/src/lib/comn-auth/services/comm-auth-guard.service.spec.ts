// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { ComnAuthGuardService } from './comn-auth-guard.service';
import { ComnSettingsService } from '../../comn-settings/services/comn-settings.service';

// The guard injects ComnAuthService, which builds a real oidc-client-ts
// UserManager from settings.OIDCSettings, so stub the settings service.
const settingsStub: Partial<ComnSettingsService> = {
  settings: {
    OIDCSettings: {
      authority: 'https://example.test/auth',
      client_id: 'test-client',
      redirect_uri: 'https://example.test/auth-callback',
    },
  },
};

describe('CommAuthGuardService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: ComnSettingsService, useValue: settingsStub }],
    }),
  );

  it('should be created', () => {
    const service: ComnAuthGuardService = TestBed.inject(ComnAuthGuardService);
    expect(service).toBeTruthy();
  });
});
