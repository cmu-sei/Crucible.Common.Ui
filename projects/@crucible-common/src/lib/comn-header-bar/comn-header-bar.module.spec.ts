// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  COMN_HEADER_BAR_SETTINGS,
  ComnHeaderBarComponent,
  ComnHeaderBarSettings,
} from '@cmusei/crucible-common/header-bar';
import { ComnHeaderBarModule } from './comn-header-bar.module';
import { ComnSettingsService } from '../comn-settings/services/comn-settings.service';

const banner: ComnHeaderBarSettings = {
  enabled: true,
  banner_background_color: '#007a33ff',
  classification_text: 'UNCLASSIFIED',
  classification_text_color: '#ffffff',
  classification_text_fontsize: '14',
  message_text: 'Maintenance tonight',
  message_text_color: '#ffff00',
  message_text_fontsize: '12',
};

// What a page shows for the banner: null when hidden, else its texts and styles.
function rendered(host: HTMLElement) {
  const bar = host.querySelector<HTMLElement>('.message-bar');
  if (!bar) {
    return null;
  }
  const [classification, message] = Array.from(bar.children) as HTMLElement[];
  return {
    background: bar.style.backgroundColor,
    classification: classification.textContent?.trim(),
    classificationSize: classification.style.fontSize,
    message: message.textContent?.trim(),
    messageColor: message.style.color,
    messageSize: message.style.fontSize,
  };
}

@Component({
  imports: [ComnHeaderBarComponent],
  template: `<comn-header-bar [settings]="settings()"></comn-header-bar>`,
})
class InputHostComponent {
  readonly settings = signal<ComnHeaderBarSettings | null | undefined>(banner);
}

@Component({
  imports: [ComnHeaderBarModule],
  template: `<comn-header-bar></comn-header-bar>`,
})
class ModuleHostComponent {}

describe('comn-header-bar', () => {
  describe('with a settings input (the header-bar entry point)', () => {
    async function render(settings: ComnHeaderBarSettings | null | undefined) {
      const fixture = TestBed.createComponent(InputHostComponent);
      fixture.componentInstance.settings.set(settings);
      fixture.detectChanges();
      await fixture.whenStable();
      return fixture;
    }

    it('shows the banner from the input', async () => {
      const fixture = await render(banner);

      expect(rendered(fixture.nativeElement)).toEqual({
        background: 'rgb(0, 122, 51)',
        classification: 'UNCLASSIFIED',
        classificationSize: '14px',
        message: 'Maintenance tonight',
        messageColor: 'rgb(255, 255, 0)',
        messageSize: '12px',
      });
    });

    it('fills blank values with the defaults', async () => {
      const fixture = await render({
        ...banner,
        banner_background_color: ' ',
        classification_text_fontsize: '',
        message_text_fontsize: '',
      });

      const shown = rendered(fixture.nativeElement);
      expect(shown?.background).toBe('rgb(212, 0, 0)');
      expect(shown?.classificationSize).toBe('22px');
      expect(shown?.messageSize).toBe('18px');
    });

    it.each([
      ['missing', undefined],
      ['null', null],
      ['disabled', { ...banner, enabled: false }],
      ['without text', { ...banner, classification_text: '', message_text: '' }],
    ])('is hidden when settings are %s', async (_, settings) => {
      const fixture = await render(settings as ComnHeaderBarSettings | null | undefined);

      expect(rendered(fixture.nativeElement)).toBeNull();
    });

    it('updates when the input changes', async () => {
      const fixture = await render(undefined);
      expect(rendered(fixture.nativeElement)).toBeNull();

      fixture.componentInstance.settings.set(banner);
      fixture.detectChanges();

      expect(rendered(fixture.nativeElement)?.classification).toBe('UNCLASSIFIED');
    });

    it('prefers the input over provided settings', async () => {
      TestBed.overrideProvider(COMN_HEADER_BAR_SETTINGS, {
        useValue: { ...banner, classification_text: 'PROVIDED' },
      });
      const fixture = await render(banner);

      expect(rendered(fixture.nativeElement)?.classification).toBe('UNCLASSIFIED');
    });

    it('is hidden in a frame, where the parent page shows the banner', async () => {
      const top = vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
      try {
        const fixture = await render(banner);

        expect(rendered(fixture.nativeElement)).toBeNull();
      } finally {
        top.mockRestore();
      }
    });
  });

  // Existing apps: import ComnHeaderBarModule and use <comn-header-bar> with no inputs.
  describe('through ComnHeaderBarModule (the main entry point)', () => {
    async function render(settings: object) {
      TestBed.configureTestingModule({
        providers: [{ provide: ComnSettingsService, useValue: { settings } }],
      });
      const fixture = TestBed.createComponent(ModuleHostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      return fixture;
    }

    it('reads HeaderBarSettings from ComnSettingsService', async () => {
      const fixture = await render({ HeaderBarSettings: banner });

      expect(rendered(fixture.nativeElement)?.classification).toBe('UNCLASSIFIED');
      expect(rendered(fixture.nativeElement)?.message).toBe('Maintenance tonight');
    });

    it('is hidden when the settings have no HeaderBarSettings', async () => {
      const fixture = await render({});

      expect(rendered(fixture.nativeElement)).toBeNull();
    });
  });
});
