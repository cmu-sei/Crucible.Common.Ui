// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { CrucibleDialogComponent } from './crucible-dialog.component';
import { CRUCIBLE_DIALOG_IMPORTS } from '../../index';

class MatDialogRefStub {
    disableClose = false;
    closeCount = 0;
    private readonly keydown$ = new Subject<KeyboardEvent>();
    keydownEvents() {
        return this.keydown$.asObservable();
    }
    close(): void {
        this.closeCount++;
    }
    /** Test helper: simulate a keydown reaching the dialog overlay. */
    emitKeydown(key: string): void {
        this.keydown$.next(new KeyboardEvent('keydown', { key }));
    }
}

@Component({
    template: `
    <crucible-dialog
      [title]="title"
      [form]="form"
      [submitLabel]="submitLabel"
      [submitDisabled]="submitDisabled()"
      [loading]="loading()"
      [loadingLabel]="loadingLabel"
      [errorMessage]="errorMessage()"
      [guardUnsavedWork]="guardUnsavedWork()"
      (submit)="onSubmit()"
      (cancel)="onCancel()"
    >
      <ng-container crucibleDialogContent [formGroup]="form">
        <input id="name-field" formControlName="name" />
        <textarea id="notes-field" formControlName="notes"></textarea>
      </ng-container>
    </crucible-dialog>
  `,
    imports: [...CRUCIBLE_DIALOG_IMPORTS, ReactiveFormsModule],
})
class FormHostComponent {
    @ViewChild(CrucibleDialogComponent)
    dialog!: CrucibleDialogComponent;
    title = 'Edit Directory';
    form = new FormGroup({
        name: new FormControl('', Validators.required),
        notes: new FormControl(''),
    });
    submitLabel = 'Save';
    // Signals so that mutating them in a zoneless test schedules change
    // detection, which `await fixture.whenStable()` then flushes.
    submitDisabled = signal(false);
    loading = signal(false);
    loadingLabel = 'Saving…';
    errorMessage = signal<string | null>(null);
    guardUnsavedWork = signal(false);
    submitted = 0;
    cancelled = 0;
    onSubmit() {
        this.submitted++;
    }
    onCancel() {
        this.cancelled++;
    }
}

@Component({
    template: `
    <crucible-dialog
      [title]="title"
      [submitDisabled]="submitDisabled()"
      (submit)="onSubmit()"
      (cancel)="onCancel()"
    >
      <ng-container crucibleDialogContent>
        <p>Body text</p>
      </ng-container>
    </crucible-dialog>
  `,
    imports: [...CRUCIBLE_DIALOG_IMPORTS],
})
class ContentHostComponent {
    @ViewChild(CrucibleDialogComponent)
    dialog!: CrucibleDialogComponent;
    title = 'Confirm Thing';
    // Signal so a zoneless mutation schedules change detection (see FormHostComponent).
    submitDisabled = signal(false);
    submitted = 0;
    cancelled = 0;
    onSubmit() {
        this.submitted++;
    }
    onCancel() {
        this.cancelled++;
    }
}

@Component({
    // Mirrors the confirm-dialog usage: no form, hideDefaultActions, and a fully
    // projected [crucibleDialogActions] block. This is the combination that
    // regressed when the wrapper duplicated <ng-content> across @if branches.
    template: `
    <crucible-dialog [title]="title" [hideDefaultActions]="true">
      <p crucibleDialogContent id="projected-message">{{ message }}</p>
      <ng-container crucibleDialogActions>
        <button id="proj-no" matButton="outlined" type="button">No</button>
        <button id="proj-yes" matButton="filled" type="button">Yes</button>
      </ng-container>
    </crucible-dialog>
  `,
    imports: [...CRUCIBLE_DIALOG_IMPORTS],
})
class ProjectedActionsHostComponent {
    title = 'Delete Project?';
    message = 'Delete Project Demo Project?';
}

@Component({
    // A custom title/header (e.g. an icon button alongside the title text) projected
    // via [crucibleDialogTitle] instead of the plain `title` string input.
    template: `
    <crucible-dialog>
      <div crucibleDialogTitle>
        <span id="custom-title-text">Edit Organization</span>
        <button id="title-icon" type="button">x</button>
      </div>
      <p crucibleDialogContent>Body</p>
    </crucible-dialog>
  `,
    imports: [...CRUCIBLE_DIALOG_IMPORTS],
})
class ProjectedTitleHostComponent {
}

describe('CrucibleDialogComponent', () => {
    let dialogRef: MatDialogRefStub;

    beforeEach(async () => {
        dialogRef = new MatDialogRefStub();
        await TestBed.configureTestingModule({
            // ReactiveFormsModule is imported the way a real consumer does (the wrapper
            // imports it internally but does not re-export it, since the projected
            // [formGroup]/formControlName resolve in the consumer's own context).
            imports: [
                ...CRUCIBLE_DIALOG_IMPORTS,
                ReactiveFormsModule,
                NoopAnimationsModule,
                FormHostComponent,
                ContentHostComponent,
                ProjectedActionsHostComponent,
                ProjectedTitleHostComponent,
            ],
            providers: [{ provide: MatDialogRef, useValue: dialogRef }],
        }).compileComponents();
    });

    function noPositiveTabindex(el: HTMLElement): boolean {
        const withTab = el.querySelectorAll('[tabindex]');
        return Array.from(withTab).every((n) => Number(n.getAttribute('tabindex')) <= 0);
    }

    describe('form mode', () => {
        let fixture: ComponentFixture<FormHostComponent>;
        let host: FormHostComponent;

        beforeEach(async () => {
            fixture = TestBed.createComponent(FormHostComponent);
            host = fixture.componentInstance;
            await fixture.whenStable();
        });

        it('creates and renders the title in h2 mat-dialog-title', () => {
            expect(host.dialog).toBeTruthy();
            const h2: HTMLElement = fixture.nativeElement.querySelector('h2[mat-dialog-title]');
            expect(h2.textContent?.trim()).toBe('Edit Directory');
        });

        it('projects content into mat-dialog-content', () => {
            const content: HTMLElement = fixture.nativeElement.querySelector('mat-dialog-content');
            expect(content.querySelector('#name-field')).toBeTruthy();
        });

        it('renders exactly one primary filled button, right-most in DOM', () => {
            const actions: HTMLElement = fixture.nativeElement.querySelector('mat-dialog-actions');
            const buttons = actions.querySelectorAll('button');
            // Material 21 modern variant: the primary is matButton="filled".
            const primaries = actions.querySelectorAll<HTMLButtonElement>('button[matButton="filled"]');
            expect(primaries.length).toBe(1);
            // primary is the last button in DOM order
            expect(buttons[buttons.length - 1]).toBe(primaries[0]);
        });

        it('renders the secondary as a stroked button', () => {
            const secondary = fixture.nativeElement.querySelector('button[mat-stroked-button], button[matButton="outlined"]');
            expect(secondary).toBeTruthy();
        });

        it('has no positive tabindex anywhere', () => {
            expect(noPositiveTabindex(fixture.nativeElement)).toBe(true);
        });

        it('disables the primary when submitDisabled is true', async () => {
            host.submitDisabled.set(true);
            await fixture.whenStable();
            const primary: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
            expect(primary.disabled).toBe(true);
        });

        it('disables the primary and shows the in-button progress indicator + loadingLabel while loading', async () => {
            host.loading.set(true);
            await fixture.whenStable();
            const primary: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
            expect(primary.disabled).toBe(true);
            // An indeterminate spinner is shown inside the button while loading.
            expect(primary.querySelector('mat-progress-spinner')).toBeTruthy();
            expect(primary.textContent).toContain('Saving…');
        });

        it('renders errorMessage with role=alert', async () => {
            host.errorMessage.set('It failed');
            await fixture.whenStable();
            const alert: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');
            expect(alert).toBeTruthy();
            expect(alert.textContent).toContain('It failed');
            expect(alert.classList).toContain('crucible-dialog-error');
        });

        it('emits submit on ngSubmit', async () => {
            const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
            form.dispatchEvent(new Event('submit'));
            await fixture.whenStable();
            expect(host.submitted).toBe(1);
        });

        it('submits when Enter is pressed in a text input, even if a host cancels the default action', async () => {
            // A consuming app may register a global keydown handler that calls
            // preventDefault() on Enter (e.g. @ngneat/hotkeys with a default
            // "enter" shortcut and allowIn:["INPUT"]), which suppresses the
            // browser's native implicit form submission. The dialog must submit
            // on Enter regardless, so form modals are operable by keyboard (§7).
            const input: HTMLInputElement = fixture.nativeElement.querySelector('#name-field');
            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true,
            });
            // Simulate the host having already cancelled the default action.
            event.preventDefault();
            input.dispatchEvent(event);
            await fixture.whenStable();
            expect(host.submitted).toBe(1);
        });

        it('emits submit exactly once on Enter (no double-fire with native submit)', async () => {
            const input: HTMLInputElement = fixture.nativeElement.querySelector('#name-field');
            input.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
            );
            await fixture.whenStable();
            expect(host.submitted).toBe(1);
        });

        it('does NOT submit on Enter from a textarea (preserves newline entry)', async () => {
            const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('#notes-field');
            textarea.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
            );
            await fixture.whenStable();
            expect(host.submitted).toBe(0);
        });

        it('does NOT submit on Enter while the primary is disabled', async () => {
            host.submitDisabled.set(true);
            await fixture.whenStable();
            const input: HTMLInputElement = fixture.nativeElement.querySelector('#name-field');
            input.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
            );
            await fixture.whenStable();
            expect(host.submitted).toBe(0);
        });

        it('emits submit exactly once when the type="submit" primary is clicked (no double-fire)', async () => {
            // Clicking a type="submit" button triggers BOTH (click)=onSubmitClick and
            // the form's (ngSubmit). onSubmitClick must no-op in form mode so submit
            // fires exactly once (via ngSubmit), not twice.
            const primary: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
            primary.click();
            await fixture.whenStable();
            expect(host.submitted).toBe(1);
        });

        it('emits cancel when the secondary is clicked', () => {
            const secondary: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="button"]');
            secondary.click();
            expect(host.cancelled).toBe(1);
        });

        it('closes the dialog when the default Cancel is clicked (declarative mat-dialog-close)', () => {
            // Cancel self-closes via [mat-dialog-close] so a host that omits a (cancel)
            // handler still gets a working dismiss button.
            const secondary: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="button"]');
            secondary.click();
            expect(dialogRef.closeCount).toBe(1);
        });

        it('disables backdrop dismissal by default (disableClose true on the ref)', () => {
            // §7: backdrop click-outside is OFF for every dialog built on the shell so
            // an accidental outside-click can't drop in-progress work. disableClose:true
            // also suppresses Material's native Escape — re-enabled by the shell below.
            expect(dialogRef.disableClose).toBe(true);
        });

        it('re-enables Escape: an Escape keydown closes the dialog by default', () => {
            dialogRef.emitKeydown('Escape');
            expect(dialogRef.closeCount).toBe(1);
        });

        it('ignores non-Escape keydowns', () => {
            dialogRef.emitKeydown('Enter');
            expect(dialogRef.closeCount).toBe(0);
        });

        it('suppresses Escape while guarding unsaved work', async () => {
            host.guardUnsavedWork.set(true);
            await fixture.whenStable();
            dialogRef.emitKeydown('Escape');
            expect(dialogRef.closeCount).toBe(0);
        });

        it('suppresses Escape while loading (in-flight request)', async () => {
            host.loading.set(true);
            await fixture.whenStable();
            dialogRef.emitKeydown('Escape');
            expect(dialogRef.closeCount).toBe(0);
        });

        it('places cdkFocusInitial unconditionally on the primary (harmless in form mode)', () => {
            const primary: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
            expect(primary.hasAttribute('cdkFocusInitial')).toBe(true);
        });
    });

    describe('content mode (no form)', () => {
        let fixture: ComponentFixture<ContentHostComponent>;
        let host: ContentHostComponent;

        beforeEach(async () => {
            fixture = TestBed.createComponent(ContentHostComponent);
            host = fixture.componentInstance;
            await fixture.whenStable();
        });

        it('renders no <form>', () => {
            expect(fixture.nativeElement.querySelector('form')).toBeNull();
        });

        it('emits submit when the primary is clicked in button mode', () => {
            const primary: HTMLButtonElement = fixture.nativeElement.querySelector('mat-dialog-actions button:last-of-type');
            primary.click();
            expect(host.submitted).toBe(1);
        });

        it('places cdkFocusInitial unconditionally on the primary', () => {
            const primary: HTMLButtonElement = fixture.nativeElement.querySelector('mat-dialog-actions button:last-of-type');
            expect(primary.hasAttribute('cdkFocusInitial')).toBe(true);
        });

        it('keeps cdkFocusInitial on the primary even when disabled (focus trap falls back to Cancel)', async () => {
            host.submitDisabled.set(true);
            await fixture.whenStable();
            const primary: HTMLButtonElement = fixture.nativeElement.querySelector('mat-dialog-actions button:last-of-type');
            expect(primary.disabled).toBe(true);
            // Marker stays put; Material's focus trap skips the disabled cdkFocusInitial
            // element and focuses the next tabbable element (the always-enabled Cancel).
            expect(primary.hasAttribute('cdkFocusInitial')).toBe(true);
        });
    });

    // Regression: a no-form dialog with hideDefaultActions + projected actions
    // must project BOTH its content and its actions. Previously the wrapper
    // declared the <ng-content> slots inside the unrendered form branch, so a
    // confirm-style dialog rendered only its title (empty body, no buttons).
    describe('content mode with projected actions (confirm-style)', () => {
        let fixture: ComponentFixture<ProjectedActionsHostComponent>;

        beforeEach(async () => {
            fixture = TestBed.createComponent(ProjectedActionsHostComponent);
            await fixture.whenStable();
        });

        it('projects the message into mat-dialog-content', () => {
            const content: HTMLElement = fixture.nativeElement.querySelector('mat-dialog-content');
            const msg = content.querySelector('#projected-message');
            expect(msg).toBeTruthy();
            expect(msg?.textContent).toContain('Delete Project Demo Project?');
        });

        it('projects the custom actions into mat-dialog-actions', () => {
            const actions: HTMLElement = fixture.nativeElement.querySelector('mat-dialog-actions');
            expect(actions.querySelector('#proj-no')).toBeTruthy();
            const yes = actions.querySelector('#proj-yes');
            expect(yes).toBeTruthy();
            // primary (Yes) is right-most in DOM order
            const buttons = actions.querySelectorAll('button');
            expect(buttons[buttons.length - 1].id).toBe('proj-yes');
        });

        it('does not render the default Cancel/Submit pair', () => {
            const actions: HTMLElement = fixture.nativeElement.querySelector('mat-dialog-actions');
            // only the two projected buttons exist
            expect(actions.querySelectorAll('button').length).toBe(2);
        });
    });

    // A projected [crucibleDialogTitle] renders custom title markup (e.g. an icon
    // button) inside the h2 mat-dialog-title, instead of the plain `title` string.
    describe('projected custom title', () => {
        let fixture: ComponentFixture<ProjectedTitleHostComponent>;

        beforeEach(async () => {
            fixture = TestBed.createComponent(ProjectedTitleHostComponent);
            await fixture.whenStable();
        });

        it('projects custom title markup into the h2 mat-dialog-title', () => {
            const h2: HTMLElement = fixture.nativeElement.querySelector('h2[mat-dialog-title]');
            expect(h2.querySelector('#custom-title-text')?.textContent).toContain('Edit Organization');
            // the icon affordance the string-only title could not express
            expect(h2.querySelector('#title-icon')).toBeTruthy();
        });
    });
});
