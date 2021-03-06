// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { ComnAuthService } from './comn-auth.service';

describe('ComnAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComnAuthService = TestBed.get(ComnAuthService);
    expect(service).toBeTruthy();
  });
});
