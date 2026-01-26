// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ComnSettingsService } from 'projects/@crucible-common/src/public-api';

@Component({
    selector: 'app-posts',
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.scss'],
    standalone: false
})
export class PostsComponent implements OnInit {
  posts$: Observable<any> = of([]);
  constructor(
    private http: HttpClient,
    private settings: ComnSettingsService
  ) {}

  ngOnInit() {
    this.posts$ = this.http.get(`${this.settings.settings.ApiUrl}/posts`);
  }
}
