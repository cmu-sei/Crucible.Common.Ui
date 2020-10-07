/*
Crucible
Copyright 2020 Carnegie Mellon University.
NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.
Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.
[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.
Carnegie Mellon(R) and CERT(R) are registered in the U.S. Patent and Trademark Office by Carnegie Mellon University.
DM20-0181
*/

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
  ],
  providers: [
    ComnAuthService,
    ComnAuthGuardService,
    ComnAuthQuery,
    ComnAuthStore,
  ],
  imports: [CommonModule, RouterModule.forChild(comnAuthRoutes)],
  exports: [],
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
