// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { ComnAuthGuardService } from './comn-auth-guard.service';

describe('CommAuthGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComnAuthGuardService = TestBed.get(ComnAuthGuardService);
    expect(service).toBeTruthy();
  });
});
