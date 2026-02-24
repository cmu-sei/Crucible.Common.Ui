// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, Optional, inject } from '@angular/core';
import { ComnSettingsService } from '../../../comn-settings/services/comn-settings.service';

@Component({
    selector: 'comn-header-bar',
    templateUrl: './comn-header-bar.component.html',
    styleUrls: ['./comn-header-bar.component.scss'],
    standalone: false
})
export class ComnHeaderBarComponent {
  constructor(
    private http: HttpClient,
    private settingsService: ComnSettingsService
  ) {
    this.MESSAGE_API_URL = this.settingsService.settings.HeaderBarSettings.url;
  }

  MESSAGE_API_URL = '';
  @Input() BannerBackgroundColor?: string = '';
  @Input() ClassificationText?: string = '';
  @Input() ClassificationTextColor?: string = '';
  @Input() ClassificationTextFontSize?: string = '';
  @Input() MessageText?: string = '';
  @Input() MessageTextColor?: string = '';
  @Input() MessageTextFontSize?: string = '';
  @Input() Enabled: boolean = true;

  ngOnInit() {
    if (this.MESSAGE_API_URL) {
      this.http.get<any>(this.MESSAGE_API_URL).subscribe({
        next: (result) => {
          this.BannerBackgroundColor = result.banner_background_color?.trim() ? result.banner_background_color : '#d40000ff';
          this.ClassificationText = result.classification_text?.trim() ? result.classification_text : '';
          this.ClassificationTextColor = result.classification_text_color?.trim() ? result.classification_text_color : '#ffffff';
          this.ClassificationTextFontSize = result.classification_text_font_size?.trim() ? result.classification_text_font_size : '22px';
          this.MessageText = result.message_text?.trim() ? result.message_text : '';
          this.MessageTextColor = result.message_text_color?.trim() ? result.message_text_color : '#ffffff';
          this.MessageTextFontSize = result.message_text_font_size?.trim() ?  result.message_text_font_size : '18px';
          this.Enabled = result.enabled ? result.enabled : false;
        },
        error: (err) => {
          this.setUIDefaults();
        }
      });
    }
    else {
      this.setUIDefaults();
    }
  }

  private setUIDefaults() {
    this.BannerBackgroundColor = "#d40000ff";
    this.ClassificationText = "";
    this.ClassificationTextColor = "#ffffff";
    this.ClassificationTextFontSize = "22px";
    this.MessageText = "";
    this.MessageTextColor = "#ffffff";
    this.MessageTextFontSize = "18px";
    this.Enabled = true;
  }
}

