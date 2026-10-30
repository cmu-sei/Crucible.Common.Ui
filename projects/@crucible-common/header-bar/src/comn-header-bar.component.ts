// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { COMN_HEADER_BAR_SETTINGS, ComnHeaderBarSettings } from './comn-header-bar-settings';

/**
 * The classification banner. Needs only @angular/core and @angular/common, so an app can use it
 * without the rest of the library: bind `settings`, or provide COMN_HEADER_BAR_SETTINGS.
 */
@Component({
  selector: 'comn-header-bar',
  templateUrl: './comn-header-bar.component.html',
  styleUrls: ['./comn-header-bar.component.scss']
})
export class ComnHeaderBarComponent {
  readonly settings = input<ComnHeaderBarSettings | null | undefined>(undefined);

  private readonly provided = inject(COMN_HEADER_BAR_SETTINGS, { optional: true });

  // When framed, the parent page shows the banner if it needs one.
  private readonly framed = (() => {
    const view = inject(DOCUMENT).defaultView;
    return !!view && view.top !== view.self;
  })();

  protected readonly banner = computed(() => {
    const s = this.settings() ?? this.provided;

    const banner = {
      backgroundColor: orDefault(s?.banner_background_color, '#d40000ff'),
      classificationText: orDefault(s?.classification_text, ''),
      classificationTextColor: orDefault(s?.classification_text_color, '#ffffff'),
      classificationTextFontSize: orDefault(s?.classification_text_fontsize, '22'),
      messageText: orDefault(s?.message_text, ''),
      messageTextColor: orDefault(s?.message_text_color, '#ffffff'),
      messageTextFontSize: orDefault(s?.message_text_fontsize, '18')
    };

    const shown = !this.framed && !!s?.enabled && !!(banner.classificationText || banner.messageText);
    return shown ? banner : null;
  });
}

// Blank or missing values take the default.
function orDefault(value: string | null | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}
