// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComnAuthLogoutComponent } from './comn-auth-logout.component';
import { ComnSettingsService } from '../../../comn-settings/services/comn-settings.service';

// Component injects ComnAuthService, which builds a real oidc-client-ts
// UserManager from settings.OIDCSettings — stub it.
const settingsStub: Partial<ComnSettingsService> = {
  settings: {
    OIDCSettings: {
      authority: 'https://example.test/auth',
      client_id: 'test-client',
      redirect_uri: 'https://example.test/auth-callback',
    },
  },
};

describe('CwdAuthLogoutComponent', () => {
  let component: ComnAuthLogoutComponent;
  let fixture: ComponentFixture<ComnAuthLogoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComnAuthLogoutComponent],
      providers: [
        { provide: ComnSettingsService, useValue: settingsStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComnAuthLogoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
