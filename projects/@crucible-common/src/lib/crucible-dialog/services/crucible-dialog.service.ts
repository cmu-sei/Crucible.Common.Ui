// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrucibleConfirmDialogComponent } from '../components/crucible-confirm-dialog/crucible-confirm-dialog.component';
import { CrucibleConfirmOptions } from '../models/crucible-confirm-options';

/**
 * App-agnostic dialog service. Opens the shared confirm/message dialog with sensible
 * defaults applied. Apps never reference {@link CrucibleConfirmDialogComponent} directly.
 */
@Injectable({ providedIn: 'root' })
export class CrucibleDialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Open a confirm/message dialog.
   * @returns the MatDialogRef; `afterClosed()` emits `true` (confirmed) or
   *          `false`/`undefined` (cancel/escape). The concrete component type is
   *          intentionally hidden (`unknown`) — callers only use `afterClosed()`.
   */
  confirm(opts: CrucibleConfirmOptions): MatDialogRef<unknown, boolean> {
    // Per-field ?? defaults (not a {...defaults, ...opts} spread): ?? only falls
    // back on null/undefined, so an explicitly-undefined caller field can no longer
    // clobber a default into empty labels / an uncapped maxWidth.
    const data: CrucibleConfirmOptions = {
      ...opts,
      confirmText: opts.confirmText ?? 'Yes',
      cancelText: opts.cancelText ?? 'No',
      maxWidth: opts.maxWidth ?? '90vw',
    };

    return this.dialog.open<
      CrucibleConfirmDialogComponent,
      CrucibleConfirmOptions,
      boolean
    >(CrucibleConfirmDialogComponent, {
      data,
      width: data.width,
      maxWidth: data.maxWidth,
      // Read-only/info confirms are always dismissible (§7); the buttons close
      // declaratively via [mat-dialog-close].
      disableClose: false,
    });
  }
}
