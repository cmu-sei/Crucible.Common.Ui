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

  /** True while Sign in again starts the redirect, so it can't run twice. */
  readonly retrying = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: ComnAuthService,
  ) {}

  ngAfterViewInit() {
    this.measure();
    // The classification banner can change height (a narrow window wraps its
    // text, fonts load), which moves this page down without changing the
    // document's size. Watch the elements above this page, and the document
    // for window resizes, and measure again.
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => this.measure());
      observer.observe(document.documentElement);
      for (
        let el: HTMLElement | null = this.host.nativeElement;
        el && el !== document.body;
        el = el.parentElement
      ) {
        if (el.previousElementSibling) {
          observer.observe(el.previousElementSibling);
        }
      }
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
          // Not expected for a redirect sign-in, which resolves with a user or
          // throws. Going home would only restart the redirect, so say so.
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
    this.retrying.set(true);
    this.authService.startAuthentication('/').catch((err: unknown) => {
      this.retrying.set(false);
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
      .catch((err: unknown) => {
        console.log(err);
      });
  }

  private measure() {
    // Distance from the top of the document, so a scrolled page measures the same.
    const top =
      this.host.nativeElement.getBoundingClientRect().top + window.scrollY;
    this.minHeight.set(`calc(100vh - ${Math.max(0, Math.round(top))}px)`);
  }
}
