// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input } from '@angular/core';
import { ComnSettingsService } from '../../../comn-settings/services/comn-settings.service';

@Component({
    selector: 'comn-header-bar',
    templateUrl: './comn-header-bar.component.html',
    styleUrls: ['./comn-header-bar.component.scss'],
    standalone: false
})
export class ComnHeaderBarComponent {
  constructor(
    private settingsService: ComnSettingsService) {
    try {
      this.BannerBackgroundColor = this.settingsService.settings.HeaderBarSettings.banner_background_color?.trim() ? this.settingsService.settings.HeaderBarSettings.banner_background_color : '#d40000ff';
      this.ClassificationText = this.settingsService.settings.HeaderBarSettings.classification_text?.trim() ? this.settingsService.settings.HeaderBarSettings.classification_text : '';
      this.ClassificationTextColor = this.settingsService.settings.HeaderBarSettings.classification_text_color?.trim() ? this.settingsService.settings.HeaderBarSettings.classification_text_color : '#ffffff';
      this.ClassificationTextFontSize = this.settingsService.settings.HeaderBarSettings.classification_text_fontsize?.trim() ? this.settingsService.settings.HeaderBarSettings.classification_text_fontsize : '22';
      this.MessageText = this.settingsService.settings.HeaderBarSettings.message_text?.trim() ? this.settingsService.settings.HeaderBarSettings.message_text : '';
      this.MessageTextColor = this.settingsService.settings.HeaderBarSettings.message_text_color?.trim() ? this.settingsService.settings.HeaderBarSettings.message_text_color : '#ffffff';
      this.MessageTextFontSize = this.settingsService.settings.HeaderBarSettings.message_text_fontsize?.trim() ?  this.settingsService.settings.HeaderBarSettings.message_text_fontsize : '18';
      this.Enabled = this.settingsService.settings.HeaderBarSettings.enabled ? this.settingsService.settings.HeaderBarSettings.enabled : false;
    }
    catch (e: unknown) {
      this.setUIDefaults();
    }

    // detect if the component is running in an iframe.
    // if true, do not display the component - the parent
    // page should handle the display of this component if needed
    if(window.top !== window.self) {
      this.Enabled = false;
    }
  }

  BannerBackgroundColor?: string = '';
  ClassificationText?: string = '';
  ClassificationTextColor?: string = '';
  ClassificationTextFontSize?: string = '';
  MessageText?: string = '';
  MessageTextColor?: string = '';
  MessageTextFontSize?: string = '';
  Enabled: boolean = true;

  private setUIDefaults() {
    this.BannerBackgroundColor = "#d40000ff";
    this.ClassificationText = "";
    this.ClassificationTextColor = "#ffffff";
    this.ClassificationTextFontSize = "22";
    this.MessageText = "";
    this.MessageTextColor = "#ffffff";
    this.MessageTextFontSize = "18";
    this.Enabled = true;
  }
}

