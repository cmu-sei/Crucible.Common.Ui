// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ComnAuthCallbackComponent } from './comn-auth-callback.component';
import { ComnSettingsService } from '../../../comn-settings/services/comn-settings.service';

// Component injects ActivatedRoute/Router and ComnAuthService, which builds a
// real oidc-client-ts UserManager from settings.OIDCSettings — stub it.
const settingsStub: Partial<ComnSettingsService> = {
  settings: {
    OIDCSettings: {
      authority: 'https://example.test/auth',
      client_id: 'test-client',
      redirect_uri: 'https://example.test/auth-callback',
    },
  },
};

describe('ComnAuthCallbackComponent', () => {
  let component: ComnAuthCallbackComponent;
  let fixture: ComponentFixture<ComnAuthCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComnAuthCallbackComponent],
      providers: [
        provideRouter([]),
        { provide: ComnSettingsService, useValue: settingsStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComnAuthCallbackComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
