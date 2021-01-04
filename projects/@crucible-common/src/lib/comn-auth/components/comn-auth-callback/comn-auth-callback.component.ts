// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComnAuthService } from '../../services/comn-auth.service';

@Component({
  selector: 'comn-auth-callback',
  templateUrl: './comn-auth-callback.component.html',
  styleUrls: ['./comn-auth-callback.component.scss'],
})
export class ComnAuthCallbackComponent implements OnInit {
  errorMessage: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: ComnAuthService
  ) {}

  ngOnInit() {
    this.route.fragment.subscribe((frag) => {
      this.validate(frag);
    });
  }

  validate(frag) {
    this.authService.completeAuthentication(frag).then(
      (user) => {
        if (user && user.state) {
          const userGuid = user.profile.sub;
          this.router.navigateByUrl(user.state || '/');
        }
      },
      (err) => {
        console.log(err);
        this.errorMessage = err;
      }
    );
  }
}
