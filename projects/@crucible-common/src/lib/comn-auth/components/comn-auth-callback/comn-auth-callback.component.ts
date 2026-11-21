// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComnAuthService } from '../../services/comn-auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'comn-auth-callback',
  templateUrl: './comn-auth-callback.component.html',
  styleUrls: ['./comn-auth-callback.component.scss'],
  standalone: false,
})
export class ComnAuthCallbackComponent implements OnInit, AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Window height minus the space the app shell takes above this page. */
  readonly minHeight = signal('100vh');

  // A signal so the error shows in zoneless apps too.
  readonly errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: ComnAuthService,
  ) {}

  ngAfterViewInit() {
    this.measure();
    // The classification banner can change height (a narrow window wraps its
    // text, fonts load), which changes the page height, so measure again.
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => this.measure());
      observer.observe(document.documentElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    }
  }

  ngOnInit() {
    this.route.fragment.pipe(take(1)).subscribe((frag) => {
      this.validate(frag);
    });
  }

  validate(frag) {
    void this.authService.completeAuthentication(frag).then(
      (user) => {
        if (!user) {
          // No sign-in came back. Going home would only restart the redirect,
          // which could loop, so say so instead.
          this.fail('Sign-in did not complete.');
          return;
        }
        // A missing state means "go home" rather than staying on the spinner.
        const state = user.state;
        void this.router.navigateByUrl(
          typeof state === 'string' && state ? state : '/',
          { replaceUrl: true },
        );
      },
      (err: unknown) => {
        console.log(err);
        this.fail(
          err instanceof Error && err.message
            ? err.message
            : 'Authentication failed.',
        );
      },
    );
  }

  signInAgain() {
    this.authService.startAuthentication('/').catch((err: unknown) => {
      this.errorMessage.set(
        err instanceof Error && err.message
          ? err.message
          : 'Could not start sign-in.',
      );
    });
  }

  /** Shows the error, unless a session already exists, then goes home. */
  private fail(message: string) {
    this.errorMessage.set(message);
    this.authService
      .isAuthenticated()
      .then((isAuthenticated) => {
        if (isAuthenticated) {
          void this.router.navigateByUrl('/', { replaceUrl: true });
        }
      })
      .catch(() => undefined);
  }

  private measure() {
    const top = this.host.nativeElement.getBoundingClientRect().top;
    this.minHeight.set(`calc(100vh - ${Math.max(0, Math.round(top))}px)`);
  }
}
