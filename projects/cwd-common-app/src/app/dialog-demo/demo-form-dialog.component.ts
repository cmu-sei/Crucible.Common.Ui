// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { CrucibleDialogModule } from 'projects/@crucible-common/src/public-api';

/**
 * Example form modal. Demonstrates the §2b form shape using <crucible-dialog>
 * as the root, with projected [crucibleDialogContent].
 */
@Component({
  selector: 'app-demo-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CrucibleDialogModule,
  ],
  template: `
    <crucible-dialog
      [title]="'Create New Project?'"
      [form]="form"
      submitLabel="Save"
      cancelLabel="Cancel"
      [submitDisabled]="!form.valid || !form.dirty"
      (submit)="save()"
    >
      <div crucibleDialogContent [formGroup]="form">
        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>Name</mat-label>
          <input
            matInput
            formControlName="name"
            cdkFocusInitial
            placeholder="Name"
          />
          @if (form.controls.name.hasError('required')) {
            <mat-error>Enter a name for the project.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="3"
            placeholder="Description"
          ></textarea>
        </mat-form-field>
      </div>
    </crucible-dialog>
  `,
})
export class DemoFormDialogComponent {
  dialogRef = inject(MatDialogRef<DemoFormDialogComponent>);

  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    description: new FormControl(''),
  });

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
