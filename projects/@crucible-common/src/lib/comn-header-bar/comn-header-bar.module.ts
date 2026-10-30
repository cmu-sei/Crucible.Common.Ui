// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { COMN_HEADER_BAR_SETTINGS, ComnHeaderBarComponent } from '@cmusei/crucible-common/header-bar';
import { ComnSettingsService } from '../comn-settings/services/comn-settings.service';

// Apps that use ComnSettingsService keep using <comn-header-bar> with no inputs; the banner reads
// HeaderBarSettings from the loaded settings, as before.
export function headerBarSettingsFromComnSettings(settings: ComnSettingsService) {
  return settings.settings?.HeaderBarSettings;
}

@NgModule({
  imports: [
    ComnHeaderBarComponent
  ],
  exports: [
    ComnHeaderBarComponent
  ],
  providers: [
    {
      provide: COMN_HEADER_BAR_SETTINGS,
      useFactory: headerBarSettingsFromComnSettings,
      deps: [ComnSettingsService]
    }
  ]
})
export class ComnHeaderBarModule { }
