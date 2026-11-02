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

describe('ComnSettingsService without COMN_SETTINGS_CONFIG', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }),
  );

  it('reads the default settings files instead of throwing', () => {
    const service = TestBed.inject(ComnSettingsService);

    expect(service.url).toBe('assets/config/settings.json');
    expect(service.sharedUrl).toBe('assets/config/settings.shared.json');
    expect(service.envUrl).toBe('assets/config/settings.env.json');
  });
});

describe('ComnSettingsService with COMN_SETTINGS_CONFIG', () => {
  it('reads the configured settings files', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: COMN_SETTINGS_CONFIG,
          useValue: { url: 'a.json', sharedUrl: 'b.json', envUrl: 'c.json' },
        },
      ],
    });

    const service = TestBed.inject(ComnSettingsService);

    expect([service.url, service.sharedUrl, service.envUrl]).toEqual(['a.json', 'b.json', 'c.json']);
  });
});
