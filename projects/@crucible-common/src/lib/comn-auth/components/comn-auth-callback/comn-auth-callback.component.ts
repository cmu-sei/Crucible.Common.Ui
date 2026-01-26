// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComnAuthService } from '../../services/comn-auth.service';
import { take } from 'rxjs';

@Component({
    selector: 'comn-auth-callback',
    templateUrl: './comn-auth-callback.component.html',
    styleUrls: ['./comn-auth-callback.component.scss'],
    standalone: false
})
export class ComnAuthCallbackComponent implements OnInit {
  errorMessage: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: ComnAuthService
  ) {}

  ngOnInit() {
    this.route.fragment.pipe(take(1)).subscribe((frag) => {
      this.validate(frag);
    });
  }

  validate(frag) {
    this.authService.completeAuthentication(frag).then(
      (user) => {
        if (user && user.state) {
          this.router.navigateByUrl('' + user.state || '/', {
            replaceUrl: true,
          });
        }
      },
      (err) => {
        console.log(err);
        this.errorMessage = err;

        if (this.authService.isAuthenticated()) {
          this.router.navigateByUrl('/', { replaceUrl: true });
        }
      }
    );
  }
}
