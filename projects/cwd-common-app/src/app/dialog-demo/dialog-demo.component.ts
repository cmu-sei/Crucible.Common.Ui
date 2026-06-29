// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CrucibleDialogService } from 'projects/@crucible-common/src/public-api';
import { DemoFormDialogComponent } from './demo-form-dialog.component';

/**
 * Playground page to exercise the shared crucible-dialog component in isolation.
 */
@Component({
  selector: 'app-dialog-demo',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div style="padding: 32px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <h1>Crucible Dialog Playground</h1>
      <button id="open-form" mat-flat-button color="primary" (click)="openForm()">
        Open Form Modal
      </button>
      <button id="open-confirm" mat-stroked-button (click)="openConfirm()">
        Open Delete Confirm
      </button>
      <p id="result">{{ result }}</p>
    </div>
  `,
})
export class DialogDemoComponent {
  private dialog = inject(MatDialog);
  private dialogService = inject(CrucibleDialogService);
  result = '';

  openForm(): void {
    const ref = this.dialog.open(DemoFormDialogComponent, {
      width: '460px',
      maxWidth: '90vw',
    });
    ref.afterClosed().subscribe((r) => {
      this.result = r ? 'Form saved: ' + JSON.stringify(r) : 'Form cancelled';
    });
  }

  openConfirm(): void {
    this.dialogService
      .confirm({
        title: 'Delete Project?',
        message: 'Delete Project Demo Project?',
        confirmText: 'Delete',
        cancelText: 'No',
      })
      .afterClosed()
      .subscribe((r) => {
        this.result = r ? 'Confirmed delete' : 'Delete cancelled';
      });
  }
}
