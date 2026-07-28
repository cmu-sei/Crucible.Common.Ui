// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CRUCIBLE_DIALOG_IMPORTS } from '../../index';

/**
 * End-to-end result semantics through a REAL MatDialog (not a MatDialogRef stub).
 * The stub-based spec proves the shell calls close() with no argument; this one
 * proves what a consumer's afterClosed() subscriber actually receives — the thing
 * that regressed when the default Cancel emitted '' instead of undefined.
 */
@Component({
  template: `
    <crucible-dialog dialogTitle="Pick" (cancel)="onCancel()">
      <p crucibleDialogContent>Body</p>
    </crucible-dialog>
  `,
  imports: [...CRUCIBLE_DIALOG_IMPORTS],
})
class PlainCancelDialogComponent {
  cancelCount = 0;
  onCancel(): void {
    this.cancelCount++;
  }
}

/**
 * Mirrors the legacy NameDialog pattern found in player.ui/caster.ui: the HOST's
 * (cancel) handler closes with its own `{ wasCancelled: true }` payload.
 */
@Component({
  template: `
    <crucible-dialog dialogTitle="Name" (cancel)="onCancel()">
      <p crucibleDialogContent>Body</p>
    </crucible-dialog>
  `,
  imports: [...CRUCIBLE_DIALOG_IMPORTS],
})
class PayloadOnCancelDialogComponent {
  constructor(private dialogRef: MatDialogRef<PayloadOnCancelDialogComponent>) {}
  onCancel(): void {
    this.dialogRef.close({ wasCancelled: true });
  }
}

describe('CrucibleDialogComponent cancel result (real MatDialog)', () => {
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [...CRUCIBLE_DIALOG_IMPORTS, NoopAnimationsModule],
    }).compileComponents();
    dialog = TestBed.inject(MatDialog);
  });

  function clickCancel(): void {
    const cancel = document.querySelector<HTMLButtonElement>(
      'mat-dialog-actions button[matButton="outlined"]',
    );
    cancel!.click();
  }

  it('afterClosed() emits undefined (never "") when the default Cancel is clicked', async () => {
    const ref = dialog.open(PlainCancelDialogComponent);
    TestBed.tick();

    const results: unknown[] = [];
    ref.afterClosed().subscribe((r) => results.push(r));

    clickCancel();
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.tick();

    expect(results.length).toBe(1);
    expect(results[0]).toBeUndefined();
    // The regression this guards: an empty string would pass a `!== undefined` guard.
    expect(results[0]).not.toBe('');
  });

  it('fires the (cancel) output exactly once per Cancel click', async () => {
    const ref = dialog.open(PlainCancelDialogComponent);
    TestBed.tick();
    const host = ref.componentInstance;

    clickCancel();
    TestBed.tick();

    expect(host.cancelCount).toBe(1);
  });

  it('a host that closes with its own payload in (cancel) has that payload overridden to undefined', async () => {
    // MatDialogRef.close() assigns _result on EVERY call, and the shell emits
    // (cancel) synchronously BEFORE calling close(). So the host's close(payload)
    // runs first and the shell's argument-less close() overwrites the result.
    // Consumers of such dialogs must therefore guard on falsiness (`!result`), not
    // just on `result.wasCancelled` — a legacy `!result.wasCancelled` check would
    // throw on undefined.
    const ref = dialog.open(PayloadOnCancelDialogComponent);
    TestBed.tick();

    const results: unknown[] = [];
    ref.afterClosed().subscribe((r) => results.push(r));

    clickCancel();
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.tick();

    expect(results.length).toBe(1);
    expect(results[0]).toBeUndefined();
  });
});
