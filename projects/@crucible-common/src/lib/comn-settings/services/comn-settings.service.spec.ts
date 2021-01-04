// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { ComnSettingsService } from './comn-settings.service';

describe('ComnSettingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComnSettingsService = TestBed.get(ComnSettingsService);
    expect(service).toBeTruthy();
  });
});
