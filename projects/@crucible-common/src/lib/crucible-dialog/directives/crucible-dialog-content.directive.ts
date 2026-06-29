// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Directive } from '@angular/core';

/**
 * Projection marker for the dialog body. Apps put `crucibleDialogContent` on the
 * container holding their fields/message; the wrapper supplies the <mat-dialog-content>
 * element so apps never hand-write it.
 */
@Directive({
  selector: '[crucibleDialogContent]',
  standalone: false,
})
export class CrucibleDialogContentDirective {}
