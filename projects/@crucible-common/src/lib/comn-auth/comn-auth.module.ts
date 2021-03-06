// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComnAuthCallbackSilentComponent } from './components/comn-auth-callback-silent/comn-auth-callback-silent.component';
import { ComnAuthCallbackComponent } from './components/comn-auth-callback/comn-auth-callback.component';
import { ComnAuthLogoutComponent } from './components/comn-auth-logout/comn-auth-logout.component';
import { ComnAuthGuardService } from './services/comn-auth-guard.service';
import { ComnAuthInterceptorService } from './services/comn-auth-interceptor.service';
import { ComnAuthService } from './services/comn-auth.service';
import { ComnAuthQuery } from './state/comn-auth.query';
import { ComnAuthStore } from './state/comn-auth.store';

const comnAuthRoutes: Routes = [
  {
    path: 'auth-callback',
    component: ComnAuthCallbackComponent,
  },
  { path: 'auth-callback-silent', component: ComnAuthCallbackSilentComponent },
  { path: 'logout', component: ComnAuthLogoutComponent },
];

@NgModule({
  declarations: [
    ComnAuthCallbackComponent,
    ComnAuthCallbackSilentComponent,
    ComnAuthLogoutComponent,
    ComnAuthCallbackComponent,
  ],
  providers: [
    ComnAuthService,
    ComnAuthGuardService,
    ComnAuthQuery,
    ComnAuthStore,
  ],
  imports: [CommonModule, RouterModule.forChild(comnAuthRoutes)],
  exports: [
    ComnAuthCallbackComponent,
    ComnAuthCallbackSilentComponent,
    ComnAuthLogoutComponent,
    ComnAuthCallbackComponent,
  ],
})
export class ComnAuthModule {
  constructor(@Optional() @SkipSelf() parentModule: ComnAuthModule) {
    if (parentModule) {
      throw new Error(
        `ComnAuthModule is already loaded, Import into AppModule only`
      );
    }
  }
  static forRoot(): ModuleWithProviders<ComnAuthModule> {
    return {
      ngModule: ComnAuthModule,
      providers: [
        ComnAuthService,
        ComnAuthGuardService,
        ComnAuthQuery,
        ComnAuthStore,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ComnAuthInterceptorService,
          deps: [ComnAuthService],
          multi: true,
        },
      ],
    };
  }
}
