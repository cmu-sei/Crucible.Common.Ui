// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpBackend, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  CRUCIBLE_THEME_CONFIG,
  CrucibleThemeConfig,
} from '../models/crucible-theme.config';
import { CrucibleFaviconService } from './crucible-favicon.service';

const SVG = `
<svg xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:#000000;}.cls-2{fill:#ffffff;}</style></defs><path class="cls-1" d="M0 0"/></svg>
`;
const DATA_PREFIX = 'data:image/svg+xml,';

function iconLinks(): HTMLLinkElement[] {
  return Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
}

function addIconLink(href: string, type?: string): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = 'icon';
  if (type) {
    link.type = type;
  }
  link.setAttribute('href', href);
  document.head.appendChild(link);
  return link;
}

/** Decoded SVG text of the current icon link's data: URI. */
function faviconSvg(): string {
  const href = iconLinks()[0].getAttribute('href')!;
  expect(href.startsWith(DATA_PREFIX)).toBe(true);
  return decodeURIComponent(href.slice(DATA_PREFIX.length));
}

describe('CrucibleFaviconService', () => {
  let httpMock: HttpTestingController;

  function setup(config: Partial<CrucibleThemeConfig> = {}): CrucibleFaviconService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CRUCIBLE_THEME_CONFIG,
          useValue: { brand: { color: '#006B6D', text: '#FFFFFF' }, ...config },
        },
        CrucibleFaviconService,
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(CrucibleFaviconService);
  }

  beforeEach(() => {
    iconLinks().forEach((l) => l.remove());
  });

  afterEach(() => {
    httpMock?.verify();
    iconLinks().forEach((l) => l.remove());
    vi.restoreAllMocks();
  });

  it('is intercepted by HttpTestingController despite building its client on HttpBackend', () => {
    setup({ faviconSvgPath: 'assets/img/logo.svg' });
    // provideHttpClientTesting() replaces HttpBackend, so the service's own
    // HttpClient(HttpBackend) talks to the testing backend.
    expect(TestBed.inject(HttpBackend)).toBe(
      TestBed.inject(HttpTestingController) as unknown as HttpBackend
    );
  });

  it('fetches faviconSvgPath when configured, ignoring the icon link', () => {
    addIconLink('favicon.svg', 'image/svg+xml');
    const service = setup({ faviconSvgPath: 'assets/img/logo.svg' });

    service.updateFavicon('#123456');
    const req = httpMock.expectOne('assets/img/logo.svg');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');
    req.flush(SVG);

    expect(faviconSvg()).toContain('.cls-1{fill:#123456;}');
  });

  it('uses the icon link href when its type is image/svg+xml', () => {
    addIconLink('assets/icon', 'image/svg+xml');
    const service = setup();

    service.updateFavicon('#123456');
    httpMock.expectOne('assets/icon').flush(SVG);

    expect(faviconSvg()).toContain('.cls-1{fill:#123456;}');
  });

  it.each(['favicon.svg', 'assets/Favicon.SVG?v=2', 'favicon.svg#frag'])(
    'uses the icon link href %s when it has an .svg extension',
    (href) => {
      addIconLink(href);
      const service = setup();

      service.updateFavicon('#123456');
      httpMock.expectOne(href).flush(SVG);

      expect(faviconSvg()).toContain('.cls-1{fill:#123456;}');
    }
  );

  it('makes no request and leaves the link alone for a .ico favicon', () => {
    const link = addIconLink('favicon.ico', 'image/x-icon');
    const service = setup();

    service.updateFavicon('#123456');

    httpMock.expectNone(() => true);
    expect(link.getAttribute('href')).toBe('favicon.ico');
  });

  it('makes no request and creates no link when there is no icon link or path', () => {
    const service = setup();

    service.updateFavicon('#123456');

    httpMock.expectNone(() => true);
    expect(iconLinks().length).toBe(0);
  });

  it('creates an icon link when none exists and a path is configured', () => {
    const service = setup({ faviconSvgPath: 'assets/img/logo.svg' });

    service.updateFavicon('#123456');
    httpMock.expectOne('assets/img/logo.svg').flush(SVG);

    const links = iconLinks();
    expect(links.length).toBe(1);
    expect(links[0].rel).toBe('icon');
    expect(links[0].parentElement).toBe(document.head);
    expect(faviconSvg()).toContain('.cls-1{fill:#123456;}');
  });

  it('replaces only the .cls-1 rule and trims the SVG', () => {
    const service = setup({ faviconSvgPath: 'logo.svg' });

    service.updateFavicon('#abcdef');
    httpMock.expectOne('logo.svg').flush(SVG);

    expect(faviconSvg()).toBe(
      SVG.trim().replace('.cls-1{fill:#000000;}', '.cls-1{fill:#abcdef;}')
    );
    expect(faviconSvg()).toContain('.cls-2{fill:#ffffff;}');
  });

  it('replaces the rule for a custom faviconFillClass', () => {
    const service = setup({ faviconSvgPath: 'logo.svg', faviconFillClass: 'cls-2' });

    service.updateFavicon('#abcdef');
    httpMock.expectOne('logo.svg').flush(SVG);

    const svg = faviconSvg();
    expect(svg).toContain('.cls-2{fill:#abcdef;}');
    expect(svg).toContain('.cls-1{fill:#000000;}');
  });

  it('matches a faviconFillClass containing regex characters literally', () => {
    const service = setup({ faviconSvgPath: 'logo.svg', faviconFillClass: 'a.b' });

    service.updateFavicon('#abcdef');
    httpMock
      .expectOne('logo.svg')
      .flush('<svg><style>.aXb{fill:#000000;}.a.b{fill:#000000;}</style></svg>');

    const svg = faviconSvg();
    expect(svg).toContain('.aXb{fill:#000000;}');
    expect(svg).toContain('.a.b{fill:#abcdef;}');
  });

  it('fetches the SVG only once across multiple colors, recoloring from the original', () => {
    const service = setup({ faviconSvgPath: 'logo.svg' });

    service.updateFavicon('#111111');
    httpMock.expectOne('logo.svg').flush(SVG);
    expect(faviconSvg()).toContain('.cls-1{fill:#111111;}');

    service.updateFavicon('#222222');
    service.updateFavicon('#333333');
    httpMock.expectNone('logo.svg');

    const svg = faviconSvg();
    expect(svg).toContain('.cls-1{fill:#333333;}');
    expect(svg).not.toContain('#111111');
    expect(svg).not.toContain('#222222');
  });

  it('treats the same color twice as a no-op', () => {
    const service = setup({ faviconSvgPath: 'logo.svg' });

    service.updateFavicon('#111111');
    httpMock.expectOne('logo.svg').flush(SVG);

    const link = iconLinks()[0];
    link.setAttribute('href', 'sentinel');
    service.updateFavicon('#111111');

    expect(link.getAttribute('href')).toBe('sentinel');
  });

  it('does not write a color superseded while the SVG was loading', () => {
    const service = setup({ faviconSvgPath: 'logo.svg' });
    const link = addIconLink('placeholder.ico');
    const observer = new MutationObserver(() => {});
    observer.observe(link, { attributes: true, attributeFilter: ['href'] });

    service.updateFavicon('#111111');
    service.updateFavicon('#222222');
    // Both calls share the single in-flight request.
    httpMock.expectOne('logo.svg').flush(SVG);

    const writes = observer.takeRecords();
    observer.disconnect();
    expect(writes.length).toBe(1);
    expect(faviconSvg()).toContain('.cls-1{fill:#222222;}');
    expect(faviconSvg()).not.toContain('#111111');
  });

  it('logs and does not throw when the SVG request fails', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const link = addIconLink('logo.svg');
    const service = setup();

    expect(() => {
      service.updateFavicon('#111111');
      httpMock
        .expectOne('logo.svg')
        .flush('nope', { status: 404, statusText: 'Not Found' });
    }).not.toThrow();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toContain('CrucibleFaviconService');
    expect(link.getAttribute('href')).toBe('logo.svg');

    // The failure is cached: later colors neither retry nor throw.
    expect(() => service.updateFavicon('#222222')).not.toThrow();
    httpMock.expectNone('logo.svg');
    expect(link.getAttribute('href')).toBe('logo.svg');
  });
});
