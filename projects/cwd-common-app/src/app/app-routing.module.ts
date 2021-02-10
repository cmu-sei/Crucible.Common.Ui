// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComnAuthGuardService } from '../../../@crucible-common/src/lib/comn-auth/services/comn-auth-guard.service';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostsComponent } from './posts/posts.component';

const routes: Routes = [
  {
    path: '',
    component: PostsComponent,
    pathMatch: 'full',
    canActivate: [ComnAuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
