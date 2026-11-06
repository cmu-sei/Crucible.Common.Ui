// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import {
  ComnSettingsModule,
  ComnAuthModule,
  ComnSettingsConfig,
} from 'projects/@crucible-common/src/public-api';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PostsComponent } from './posts/posts.component';

const settings: ComnSettingsConfig = {
  url: 'assets/config/settings.json',
  sharedUrl: 'assets/config/settings.shared.json',
  envUrl: 'assets/config/settings.env.json',
};

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ComnSettingsModule.forRoot(settings),
    ComnAuthModule.forRoot(),
    // AppComponent and PostsComponent are standalone; import rather than declare.
    AppComponent,
    PostsComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
