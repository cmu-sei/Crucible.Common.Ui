// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import {
  AfterViewInit,
  Component,
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
    const top = this.host.nativeElement.getBoundingClientRect().top;
    this.minHeight.set(`calc(100vh - ${Math.max(0, Math.round(top))}px)`);
  }

  ngOnInit() {
    this.route.fragment.pipe(take(1)).subscribe((frag) => {
      this.validate(frag);
    });
  }

  validate(frag) {
    void this.authService.completeAuthentication(frag).then(
      (user) => {
        // Always leave the callback page; a missing state means "go home"
        // rather than leaving the user stuck on the spinner.
        const state = user ? user.state : null;
        void this.router.navigateByUrl(
          typeof state === 'string' && state ? state : '/',
          {
            replaceUrl: true,
          },
        );
      },
      (err: unknown) => {
        console.log(err);
        this.errorMessage.set(
          err instanceof Error && err.message
            ? err.message
            : 'Authentication failed.',
        );

        void this.authService.isAuthenticated().then((isAuthenticated) => {
          if (isAuthenticated) {
            void this.router.navigateByUrl('/', { replaceUrl: true });
          }
        });
      },
    );
  }

  signInAgain() {
    void this.authService.startAuthentication('/');
  }
}
