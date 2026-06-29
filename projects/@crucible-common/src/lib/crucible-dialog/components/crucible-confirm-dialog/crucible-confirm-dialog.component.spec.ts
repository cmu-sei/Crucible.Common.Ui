// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CrucibleConfirmDialogComponent } from './crucible-confirm-dialog.component';
import { CrucibleConfirmOptions } from '../../models/crucible-confirm-options';

class MatDialogRefStub {
    disableClose = false;
    closed: boolean | undefined;
    close(result?: boolean) {
        this.closed = result;
    }
}

function setup(data: Partial<CrucibleConfirmOptions>) {
    const merged: CrucibleConfirmOptions = {
        title: 'Delete Project?',
        message: 'Delete Project Demo Project?',
        confirmText: 'Yes',
        cancelText: 'No',
        ...data,
    };
    const ref = new MatDialogRefStub();
    TestBed.configureTestingModule({
        imports: [CrucibleConfirmDialogComponent, NoopAnimationsModule],
        providers: [
            { provide: MAT_DIALOG_DATA, useValue: merged },
            { provide: MatDialogRef, useValue: ref },
        ],
    });
    const fixture: ComponentFixture<CrucibleConfirmDialogComponent> = TestBed.createComponent(CrucibleConfirmDialogComponent);
    fixture.detectChanges();
    return { fixture, ref };
}

describe('CrucibleConfirmDialogComponent', () => {
    it('renders the title and message', () => {
        const { fixture } = setup({});
        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('h2[mat-dialog-title]')?.textContent).toContain('Delete Project?');
        expect(el.querySelector('mat-dialog-content p')?.textContent).toContain('Delete Project Demo Project?');
    });

    it('renders default Yes/No labels (cancel first, primary last)', () => {
        const { fixture } = setup({});
        const buttons = fixture.nativeElement.querySelectorAll('mat-dialog-actions button');
        expect(buttons[0].textContent?.trim()).toBe('No');
        expect(buttons[buttons.length - 1].textContent?.trim()).toBe('Yes');
    });

    it('has no <form>', () => {
        const { fixture } = setup({});
        expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('has cdkFocusInitial on the primary only', () => {
        const { fixture } = setup({});
        const primary = fixture.nativeElement.querySelector('mat-dialog-actions button:last-of-type');
        expect(primary.hasAttribute('cdkFocusInitial')).toBe(true);
    });

    it('has no positive tabindex', () => {
        const { fixture } = setup({});
        const withTab = fixture.nativeElement.querySelectorAll('[tabindex]');
        expect(Array.from(withTab).every((n: any) => Number(n.getAttribute('tabindex')) <= 0)).toBe(true);
    });

    it('closes(true) when the primary is clicked (declarative mat-dialog-close)', () => {
        const { fixture, ref } = setup({});
        const primary: HTMLButtonElement = fixture.nativeElement.querySelector('mat-dialog-actions button:last-of-type');
        primary.click();
        expect(ref.closed).toBe(true);
    });

    it('closes(false) when the cancel button is clicked (declarative mat-dialog-close)', () => {
        const { fixture, ref } = setup({});
        const cancel: HTMLButtonElement = fixture.nativeElement.querySelector('mat-dialog-actions button:first-of-type');
        cancel.click();
        expect(ref.closed).toBe(false);
    });

    it('renders no error region or spinner (pure static skin)', () => {
        const { fixture } = setup({});
        expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
        expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
        expect(fixture.nativeElement.querySelector('mat-progress-spinner')).toBeNull();
    });
});
