// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CrucibleLandingBackgroundDirective } from '../../../crucible-landing-background/directives/crucible-landing-background.directive';
import { ComnAuthCallbackComponent } from './comn-auth-callback.component';
import { ComnAuthService } from '../../services/comn-auth.service';
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

// Never settles, so the page stays in its waiting state.
const authStub = {
  completeAuthentication: () => new Promise<void>(() => undefined),
  isAuthenticated: () => Promise.resolve(false),
  startAuthentication: () => Promise.resolve(),
};

describe('ComnAuthCallbackComponent', () => {
  let component: ComnAuthCallbackComponent;
  let fixture: ComponentFixture<ComnAuthCallbackComponent>;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComnAuthCallbackComponent],
      imports: [CrucibleLandingBackgroundDirective],
      providers: [
        provideRouter([]),
        { provide: ComnSettingsService, useValue: settingsStub },
        { provide: ComnAuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComnAuthCallbackComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the verifying message while waiting', () => {
    fixture.detectChanges();
    expect(el().querySelector('#waiting')).toBeTruthy();
    expect(el().querySelector('#error')).toBeNull();
  });

  it('shows an error and a sign-in-again button on failure', async () => {
    authStub.completeAuthentication = () =>
      Promise.reject<void>(new Error('boom'));
    component.validate(null);
    // Let the rejected promise's handler run, then render.
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    expect(el().querySelector('#error')?.textContent).toContain('boom');
    expect(el().querySelector('button')).toBeTruthy();
  });
});
