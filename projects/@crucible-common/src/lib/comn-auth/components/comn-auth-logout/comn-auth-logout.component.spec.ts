// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComnAuthLogoutComponent } from './comn-auth-logout.component';
import { ComnAuthService } from '../../services/comn-auth.service';

// The component calls ComnAuthService.logout() on init. A real one would start an
// oidc-client-ts signout redirect, which fetches the authority's metadata over the
// network; stub the service so the test never leaves the process.
const authServiceStub = { logout: vi.fn() };

describe('CwdAuthLogoutComponent', () => {
  let component: ComnAuthLogoutComponent;
  let fixture: ComponentFixture<ComnAuthLogoutComponent>;

  beforeEach(async () => {
    authServiceStub.logout.mockClear();
    await TestBed.configureTestingModule({
      declarations: [ComnAuthLogoutComponent],
      providers: [
        { provide: ComnAuthService, useValue: authServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComnAuthLogoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('logs out on init', () => {
    expect(authServiceStub.logout).toHaveBeenCalledTimes(1);
  });
});
