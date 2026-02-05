// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { ComnAuthService } from './comn-auth.service';

@Injectable({
  providedIn: 'root',
})
export class ComnAuthGuardService implements CanActivate {
  constructor(private authService: ComnAuthService) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.isAuthenticated().then((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      } else {
        return this.authService
          .startSilentAuthentication()
          .then((user) => {
            if (user && !user.expired) {
              return true;
            } else {
              return this.startAuthentication(state.url);
            }
          })
          .catch((e) => {
            return this.startAuthentication(state.url);
          });
      }
    });
  }

  private startAuthentication(url: string): Promise<boolean> {
    return this.authService
      .startAuthentication(url)
      .then(
        () => {
          return true;
        },
        (error) => {
          return false;
        }
      )
      .catch((error) => {
        return new Promise<boolean>((resolve, reject) => {
          resolve(false);
        });
      });
  }
}
