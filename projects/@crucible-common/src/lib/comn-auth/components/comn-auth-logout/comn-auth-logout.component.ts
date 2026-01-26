// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ComnAuthService } from '../../services/comn-auth.service';

@Component({
    selector: 'comn-auth-logout',
    templateUrl: './comn-auth-logout.component.html',
    styleUrls: ['./comn-auth-logout.component.scss'],
    standalone: false
})
export class ComnAuthLogoutComponent implements OnInit {
  constructor(private authService: ComnAuthService) {}

  ngOnInit() {
    this.authService.logout();
  }
}
