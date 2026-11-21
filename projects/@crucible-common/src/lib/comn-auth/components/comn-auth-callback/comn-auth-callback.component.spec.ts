// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

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

describe('ComnAuthCallbackComponent', () => {
  let component: ComnAuthCallbackComponent;
  let fixture: ComponentFixture<ComnAuthCallbackComponent>;
  let router: Router;
  let navigate: ReturnType<typeof vi.spyOn>;
  let authStub: {
    // Never settles by default, so the page stays in its waiting state.
    completeAuthentication: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    startAuthentication: ReturnType<typeof vi.fn>;
  };
  const el = () => fixture.nativeElement as HTMLElement;
  const settle = () => new Promise((resolve) => setTimeout(resolve));

  beforeEach(async () => {
    authStub = {
      completeAuthentication: vi.fn(() => new Promise(() => undefined)),
      isAuthenticated: vi.fn(() => Promise.resolve(false)),
      startAuthentication: vi.fn(() => Promise.resolve()),
    };

    await TestBed.configureTestingModule({
      declarations: [ComnAuthCallbackComponent],
      imports: [CrucibleLandingBackgroundDirective],
      providers: [
        provideRouter([]),
        { provide: ComnSettingsService, useValue: settingsStub },
        { provide: ComnAuthService, useValue: authStub },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
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

  it('goes to the saved state when sign-in completes', async () => {
    authStub.completeAuthentication.mockResolvedValue({ state: '/views/1' });
    component.validate(null);
    await settle();
    expect(navigate).toHaveBeenCalledWith('/views/1', { replaceUrl: true });
  });

  it('goes home when sign-in completes without a state', async () => {
    authStub.completeAuthentication.mockResolvedValue({ state: undefined });
    component.validate(null);
    await settle();
    expect(navigate).toHaveBeenCalledWith('/', { replaceUrl: true });
  });

  it('shows an error when sign-in returns no user', async () => {
    authStub.completeAuthentication.mockResolvedValue(undefined);
    component.validate(null);
    await settle();
    fixture.detectChanges();
    expect(el().querySelector('#error')).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows why sign-in again failed', async () => {
    authStub.completeAuthentication.mockRejectedValue(new Error('boom'));
    authStub.startAuthentication.mockRejectedValue(new Error('idp down'));
    component.validate(null);
    await settle();
    component.signInAgain();
    await settle();
    fixture.detectChanges();
    expect(el().querySelector('#error')?.textContent).toContain('idp down');
  });

  it('shows the error and a sign-in-again button when sign-in fails', async () => {
    authStub.completeAuthentication.mockRejectedValue(new Error('boom'));
    component.validate(null);
    await settle();
    fixture.detectChanges();
    expect(el().querySelector('#error')?.textContent).toContain('boom');
    expect(el().querySelector('button')).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('goes home after a failure when a session already exists', async () => {
    authStub.completeAuthentication.mockRejectedValue(new Error('boom'));
    authStub.isAuthenticated.mockResolvedValue(true);
    component.validate(null);
    await settle();
    expect(navigate).toHaveBeenCalledWith('/', { replaceUrl: true });
  });

  it('starts sign-in again from the button', async () => {
    authStub.completeAuthentication.mockRejectedValue(new Error('boom'));
    component.validate(null);
    await settle();
    fixture.detectChanges();
    el().querySelector('button')?.click();
    expect(authStub.startAuthentication).toHaveBeenCalledWith('/');
  });

  it('disables the button while sign-in again starts', async () => {
    authStub.completeAuthentication.mockRejectedValue(new Error('boom'));
    authStub.startAuthentication.mockReturnValue(new Promise(() => undefined));
    component.validate(null);
    await settle();
    fixture.detectChanges();
    el().querySelector('button')?.click();
    fixture.detectChanges();
    expect(el().querySelector('button')?.disabled).toBe(true);
  });

  it('logs and stays on the error when the session check fails', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    authStub.completeAuthentication.mockRejectedValue(new Error('boom'));
    authStub.isAuthenticated.mockRejectedValue(new Error('store down'));
    component.validate(null);
    await settle();
    expect(log).toHaveBeenCalledWith(new Error('store down'));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('enables the button again when the page is restored', async () => {
    authStub.completeAuthentication.mockRejectedValue(new Error('boom'));
    authStub.startAuthentication.mockReturnValue(new Promise(() => undefined));
    component.validate(null);
    await settle();
    component.signInAgain();
    expect(component.retrying()).toBe(true);
    window.dispatchEvent(new Event('pageshow'));
    expect(component.retrying()).toBe(false);
  });

  describe('height', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('watches the document and the elements above, and stops when destroyed', () => {
      const observe = vi.fn();
      const disconnect = vi.fn();
      vi.stubGlobal(
        'ResizeObserver',
        class {
          observe = observe;
          disconnect = disconnect;
        },
      );
      const wrapper = document.createElement('div');
      const above = document.createElement('div');
      const outlet = document.createElement('div');
      document.body.append(above, outlet, wrapper);
      const local = TestBed.createComponent(ComnAuthCallbackComponent);
      wrapper.append(local.nativeElement as HTMLElement);
      // The page sits in the wrapper; the banner is two siblings back.
      local.componentInstance.ngAfterViewInit();
      expect(observe).toHaveBeenCalledWith(document.documentElement);
      expect(observe).toHaveBeenCalledWith(above);
      expect(observe).toHaveBeenCalledWith(outlet);
      local.destroy();
      expect(disconnect).toHaveBeenCalled();
      above.remove();
      outlet.remove();
      wrapper.remove();
    });
  });
});
