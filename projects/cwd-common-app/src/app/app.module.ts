// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { environment } from './../environments/environment.prod';
import {
  ComnSettingsModule,
  ComnAuthModule,
  ComnSettingsConfig,
} from 'projects/@crucible-common/src/public-api';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { akitaDevtools } from '@datorama/akita';
import { PostsComponent } from './posts/posts.component';

const settings: ComnSettingsConfig = {
  url: 'assets/config/settings.json',
  envUrl: 'assets/config/settings.env.json',
};

akitaDevtools();
@NgModule({
  declarations: [AppComponent, PostsComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    environment.production ? [] : AkitaNgDevtools,
    ComnSettingsModule.forRoot(settings),
    ComnAuthModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
