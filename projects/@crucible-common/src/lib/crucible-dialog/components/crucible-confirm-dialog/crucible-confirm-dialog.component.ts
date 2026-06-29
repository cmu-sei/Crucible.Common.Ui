// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CrucibleConfirmOptions } from '../../models/crucible-confirm-options';

/**
 * Data-driven confirm/message dialog. Opened ONLY via {@link CrucibleDialogService};
 * apps never reference this component directly. It holds zero logic and zero state:
 * a themeable skin over a static Material confirm dialog whose buttons close the
 * dialog declaratively via [mat-dialog-close].
 */
// 'crucible-' selector prefix is an intentional deviation from the lib's historical
// 'lib' tslint prefix: Angular 21 removed the tslint builder so ng lint no longer
// enforces it, and renaming would churn every Caster template.
@Component({
  selector: 'crucible-confirm-dialog',
  templateUrl: './crucible-confirm-dialog.component.html',
  standalone: false,
})
export class CrucibleConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: Required<
      Pick<CrucibleConfirmOptions, 'title' | 'message' | 'confirmText' | 'cancelText'>
    > &
      CrucibleConfirmOptions,
  ) {}
}
