// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ComnSettingsService } from './comn-settings.service';
import { COMN_SETTINGS_CONFIG } from '../models/comn-settings';

describe('ComnSettingsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        // The service injects HttpBackend directly; provide the testing backend.
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        // @Optional() injects null (not the constructor default) when no provider
        // exists, so supply the config token explicitly.
        {
          provide: COMN_SETTINGS_CONFIG,
          useValue: {
            url: 'assets/config/settings.json',
            sharedUrl: 'assets/config/settings.shared.json',
            envUrl: 'assets/config/settings.env.json',
          },
        },
      ],
    }),
  );

  it('should be created', () => {
    const service: ComnSettingsService = TestBed.inject(ComnSettingsService);
    expect(service).toBeTruthy();
  });
});
