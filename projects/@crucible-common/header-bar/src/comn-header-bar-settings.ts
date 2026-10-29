/*
Copyright 2021 Carnegie Mellon University. All Rights Reserved.
 Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.
*/

import { InjectionToken } from '@angular/core';

export interface ComnHeaderBarSettings {
  banner_background_color: string,
  classification_text: string,
  classification_text_color: string,
  classification_text_fontsize: string,
  message_text: string,
  message_text_color: string,
  message_text_fontsize: string,
  enabled: boolean
}

/**
 * Settings for a comn-header-bar that has no settings input. ComnHeaderBarModule provides it from
 * ComnSettingsService; an app that has its own settings service can bind the input instead.
 */
export const COMN_HEADER_BAR_SETTINGS = new InjectionToken<ComnHeaderBarSettings | null | undefined>(
  'COMN_HEADER_BAR_SETTINGS'
);
