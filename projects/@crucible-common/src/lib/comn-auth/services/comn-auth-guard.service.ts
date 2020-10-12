/*
Crucible
Copyright 2020 Carnegie Mellon University.
NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.
Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.
[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.
Carnegie Mellon(R) and CERT(R) are registered in the U.S. Patent and Trademark Office by Carnegie Mellon University.
DM20-0181
*/

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';
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
    return this.authService.startAuthentication(url).then((user) => {
      if (user && !user.expired) {
        return true;
      } else {
        return false;
      }
    });
  }
}
