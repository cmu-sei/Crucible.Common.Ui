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
import { HttpClientModule } from '@angular/common/http';
import {
  APP_INITIALIZER,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';

import {
  ComnSettingsConfig,
  COMN_SETTINGS_CONFIG,
} from './models/comn-settings';
import { ComnSettingsService } from './services/comn-settings.service';

export function get_settings(settings: ComnSettingsService) {
  // Returning just the lambda function causes AOT to break.
  // https://stackoverflow.com/questions/51976671/app-initializer-in-library-causes-lambda-not-supported-error
  const ret = () => settings.load();
  return ret;
}

export const COMN_SETTINGS_TOKEN = new InjectionToken('ComnSettings');

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: get_settings,
      deps: [ComnSettingsService],
      multi: true,
    },
  ],
  exports: [],
})
export class ComnSettingsModule {
  constructor(@Optional() @SkipSelf() parentModule: ComnSettingsModule) {
    if (parentModule) {
      throw new Error(
        `CwdSettingsModule is already loaded. Import into AppModule only`
      );
    }
  }

  static forRoot(
    config?: ComnSettingsConfig
  ): ModuleWithProviders<ComnSettingsModule> {
    return {
      ngModule: ComnSettingsModule,
      providers: [
        ComnSettingsService,
        {
          provide: APP_INITIALIZER,
          useFactory: get_settings,
          deps: [ComnSettingsService],
          multi: true,
        },
        { provide: COMN_SETTINGS_CONFIG, useValue: config },
      ],
    };
  }
}
