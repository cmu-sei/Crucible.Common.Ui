// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ComnAuthService } from '../../services/comn-auth.service';

@Component({
  selector: 'comn-auth-callback-silent',
  templateUrl: './comn-auth-callback-silent.component.html',
  styleUrls: ['./comn-auth-callback-silent.component.scss'],
})
export class ComnAuthCallbackSilentComponent implements OnInit {
  constructor(private authService: ComnAuthService) {}

  ngOnInit() {
    this.validate();
  }

  validate() {
    this.authService.completeSilentAuthentication();
  }
}
