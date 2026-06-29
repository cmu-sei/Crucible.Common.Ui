// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CrucibleConfirmDialogComponent } from './components/crucible-confirm-dialog/crucible-confirm-dialog.component';
import { CrucibleDialogComponent } from './components/crucible-dialog/crucible-dialog.component';
import { CrucibleDialogActionsDirective } from './directives/crucible-dialog-actions.directive';
import { CrucibleDialogContentDirective } from './directives/crucible-dialog-content.directive';
import { CrucibleDialogTitleDirective } from './directives/crucible-dialog-title.directive';

@NgModule({
  declarations: [
    CrucibleDialogComponent,
    CrucibleConfirmDialogComponent,
    CrucibleDialogContentDirective,
    CrucibleDialogActionsDirective,
    CrucibleDialogTitleDirective,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    A11yModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    // Wrapper + directives are public so apps can use [crucibleDialogContent] /
    // [crucibleDialogActions] / [crucibleDialogTitle] in their own templates. The
    // confirm component is intentionally NOT exported — it is opened only via
    // CrucibleDialogService.
    CrucibleDialogComponent,
    CrucibleDialogContentDirective,
    CrucibleDialogActionsDirective,
    CrucibleDialogTitleDirective,
    // Re-export the Material/CDK modules consumers need INSIDE projected content
    // (e.g. the README's [crucibleDialogActions] footer with mat-dialog-close, a
    // [crucibleDialogTitle] with matIconButton + mat-icon, or cdkFocusInitial on a
    // field). Projected content compiles in the consumer's template context, not
    // the wrapper's, so importing CrucibleDialogModule alone must make these
    // directives resolve without each app re-importing MatDialog/MatButton/MatIcon.
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    A11yModule,
  ],
})
export class CrucibleDialogModule {}
