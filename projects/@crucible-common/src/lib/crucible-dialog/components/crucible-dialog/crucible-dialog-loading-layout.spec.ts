// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

// Regression: while loading, the primary's label text and the in-flight spinner
// must sit side by side on ONE line, not stacked.
//
// Material renders every button's default-slot children inside a single
// <span class="mdc-button__label"> that gets only `position: relative` — an
// INLINE box. mat-progress-spinner is `display: block`, so a bare spinner
// sibling of the label text forces a line break and drops below "Uploading…".
// The .mdc-button host being inline-flex does not help: it lays out the label
// span, ripple and focus indicator, not the label span's own contents.
//
// The shell must therefore own this layout — a consumer cannot fix it without
// ::ng-deep into the library's internals, and the label span is Material's
// element (no `_ngcontent-*` attribute), so an emulated-encapsulation rule
// targeting `.mdc-button__label` from this component is rewritten to a selector
// that never matches. The fix wraps the pair in an element this component owns.
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CRUCIBLE_DIALOG_IMPORTS } from '../../index';

@Component({
  template: `
    <crucible-dialog
      dialogTitle="Upload File"
      [form]="form"
      submitLabel="Upload"
      loadingLabel="Uploading…"
      [loading]="loading()"
    >
      <ng-container crucibleDialogContent [formGroup]="form">
        <input id="name-field" formControlName="name" />
      </ng-container>
    </crucible-dialog>
  `,
  imports: [...CRUCIBLE_DIALOG_IMPORTS, ReactiveFormsModule],
})
class LoadingHostComponent {
  form = new FormGroup({ name: new FormControl('') });
  // Signal so a zoneless mutation schedules change detection.
  loading = signal(false);
}

describe('CrucibleDialogComponent loading layout', () => {
  let fixture: ComponentFixture<LoadingHostComponent>;
  let host: LoadingHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ...CRUCIBLE_DIALOG_IMPORTS,
        ReactiveFormsModule,
        NoopAnimationsModule,
        LoadingHostComponent,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LoadingHostComponent);
    host = fixture.componentInstance;
    // The component styles only apply to computed style once the element is in
    // the document, so attach the fixture root to the body.
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  function primary(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  it('lays the loading label and spinner out inline on a single row', async () => {
    host.loading.set(true);
    await fixture.whenStable();

    const spinner: HTMLElement = primary().querySelector('mat-progress-spinner')!;
    // The spinner's containing block must be a flex row owned by this component,
    // NOT Material's inline .mdc-button__label span.
    const row = spinner.parentElement!;
    const rowStyle = getComputedStyle(row);
    expect(rowStyle.display).toBe('inline-flex');
    expect(rowStyle.alignItems).toBe('center');

    // The label text and the spinner are siblings within that row, so the text
    // cannot be pushed onto its own line by the block-level spinner.
    expect(row.textContent).toContain('Uploading…');
  });

  it('separates the label from the spinner with a gap rather than a text space', async () => {
    host.loading.set(true);
    await fixture.whenStable();

    const spinner: HTMLElement = primary().querySelector('mat-progress-spinner')!;
    expect(getComputedStyle(spinner.parentElement!).gap).toBe('8px');
  });

  it('applies the row layout to a no-form (content mode) dialog too', async () => {
    // Content mode renders a different template branch; the layout fix must not
    // be scoped to the form branch only.
    @Component({
      template: `
        <crucible-dialog dialogTitle="Delete" submitLabel="Delete" loadingLabel="Deleting…" loading>
          <p crucibleDialogContent>Body</p>
        </crucible-dialog>
      `,
      imports: [...CRUCIBLE_DIALOG_IMPORTS],
    })
    class ContentLoadingHost {}

    const contentFixture = TestBed.createComponent(ContentLoadingHost);
    document.body.appendChild(contentFixture.nativeElement);
    await contentFixture.whenStable();

    const spinner: HTMLElement = contentFixture.nativeElement.querySelector(
      'mat-progress-spinner',
    )!;
    expect(getComputedStyle(spinner.parentElement!).display).toBe('inline-flex');
    contentFixture.nativeElement.remove();
  });

  it('renders no extra layout wrapper when not loading', async () => {
    // Not loading: the button holds just its label text, so the theme's own
    // button layout applies with nothing added.
    expect(primary().querySelector('mat-progress-spinner')).toBeNull();
    expect(primary().textContent?.trim()).toBe('Upload');
  });
});
