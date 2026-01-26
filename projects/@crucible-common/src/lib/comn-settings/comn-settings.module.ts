// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { InjectionToken, ModuleWithProviders, NgModule, Optional, SkipSelf, inject, provideAppInitializer } from '@angular/core';

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

@NgModule({ declarations: [],
    exports: [], imports: [CommonModule], providers: [
        provideAppInitializer(() => {
        const initializerFn = (get_settings)(inject(ComnSettingsService));
        return initializerFn();
      }),
        provideHttpClient(withInterceptorsFromDi()),
    ] })
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
        provideAppInitializer(() => {
        const initializerFn = (get_settings)(inject(ComnSettingsService));
        return initializerFn();
      }),
        { provide: COMN_SETTINGS_CONFIG, useValue: config },
      ],
    };
  }
}
