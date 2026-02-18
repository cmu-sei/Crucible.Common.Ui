// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CRUCIBLE_FAVICON_SVG_PATH, CRUCIBLE_FAVICON_FILL_CLASS } from '../models/comn-theme.config';

@Injectable()
export class ComnFaviconService {
  private http = inject(HttpClient);
  private svgPath = inject(CRUCIBLE_FAVICON_SVG_PATH);
  private fillClass = inject(CRUCIBLE_FAVICON_FILL_CLASS);

  private svgContent: string | null = null;
  private isLoading = false;
  private pendingColor: string | null = null;

  constructor() {
    this.loadSvgIcon();
  }

  private loadSvgIcon(): void {
    if (this.isLoading || this.svgContent) {
      return;
    }

    this.isLoading = true;
    this.http
      .get(this.svgPath, { responseType: 'text' })
      .subscribe({
        next: (svg) => {
          this.svgContent = svg.trim();
          this.isLoading = false;

          if (this.pendingColor) {
            this.updateFavicon(this.pendingColor);
            this.pendingColor = null;
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('ComnFaviconService: Failed to load SVG', err);
        }
      });
  }

  /**
   * Update favicon with the given hex color
   * @param hexColor The hex color to apply to the favicon (e.g., '#008740')
   */
  updateFavicon(hexColor: string): void {
    if (!this.svgContent) {
      this.pendingColor = hexColor;
      return;
    }

    const coloredSvg = this.svgContent.replace(
      `.${this.fillClass}{}`,
      `.${this.fillClass}{fill:${hexColor};}`
    );

    const encodedSvg = encodeURIComponent(coloredSvg);
    const dataUri = `data:image/svg+xml,${encodedSvg}`;

    let faviconLink = document.querySelector<HTMLLinkElement>(
      "link[rel*='icon']"
    );
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = dataUri;
  }
}
