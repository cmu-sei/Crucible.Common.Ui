// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { ComnAuthInterceptorService } from './comn-auth-interceptor.service';

describe('ComnAuthInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComnAuthInterceptorService = TestBed.get(
      ComnAuthInterceptorService
    );
    expect(service).toBeTruthy();
  });
});
