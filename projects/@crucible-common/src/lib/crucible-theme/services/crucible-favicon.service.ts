// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpBackend, HttpClient } from '@angular/common/http';
import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { CRUCIBLE_THEME_CONFIG } from '../models/crucible-theme.config';

/**
 * Recolors the app's SVG favicon. The SVG is fetched once and cached; each
 * update writes a fresh `data:` URI so repeated calls always start from the
 * original artwork.
 */
@Injectable()
export class CrucibleFaviconService {
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(CRUCIBLE_THEME_CONFIG);
  // Bypass interceptors, as ComnSettingsService does: this is a static asset.
  private readonly http = new HttpClient(inject(HttpBackend));
  private svg$: Observable<string | null> | undefined;
  private lastColor: string | undefined;

  /** Fill the favicon's `faviconFillClass` shapes with `hexColor`. */
  updateFavicon(hexColor: string): void {
    if (hexColor === this.lastColor) {
      return;
    }
    this.lastColor = hexColor;

    this.loadSvg().subscribe((svg) => {
      // A later call has superseded this one while the SVG was loading.
      if (!svg || hexColor !== this.lastColor) {
        return;
      }
      const fillClass = this.config.faviconFillClass || 'cls-1';
      const escaped = fillClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const colored = svg.replace(
        new RegExp(`\\.${escaped}\\{[^}]*\\}`),
        `.${fillClass}{fill:${hexColor};}`
      );
      this.iconLink(true)!.href =
        `data:image/svg+xml,${encodeURIComponent(colored)}`;
    });
  }

  private loadSvg(): Observable<string | null> {
    if (!this.svg$) {
      const path = this.svgPath();
      this.svg$ = (
        path
          ? this.http.get(path, { responseType: 'text' }).pipe(
              map((svg) => svg.trim()),
              catchError((err) => {
                console.error('CrucibleFaviconService: failed to load SVG', err);
                return of(null);
              })
            )
          : of(null)
      ).pipe(shareReplay(1));
    }
    return this.svg$;
  }

  /** The configured SVG path, else the page's icon link when it is an SVG. */
  private svgPath(): string | null {
    if (this.config.faviconSvgPath) {
      return this.config.faviconSvgPath;
    }
    const link = this.iconLink(false);
    const href = link?.getAttribute('href');
    if (!href) {
      return null;
    }
    const isSvg =
      link!.type === 'image/svg+xml' || /\.svg(\?|#|$)/i.test(href);
    return isSvg ? href : null;
  }

  private iconLink(create: boolean): HTMLLinkElement | null {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link && create) {
      link = this.document.createElement('link');
      link.rel = 'icon';
      this.document.head.appendChild(link);
    }
    return link;
  }
}
