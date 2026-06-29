// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CrucibleDialogComponent } from './components/crucible-dialog/crucible-dialog.component';
import { CrucibleDialogActionsDirective } from './directives/crucible-dialog-actions.directive';
import { CrucibleDialogContentDirective } from './directives/crucible-dialog-content.directive';
import { CrucibleDialogTitleDirective } from './directives/crucible-dialog-title.directive';

export * from './components/crucible-dialog/crucible-dialog.component';
// CrucibleConfirmDialogComponent is intentionally NOT exported: it is opened only
// via CrucibleDialogService.confirm, never referenced by apps. Exporting it would
// invite undefined-label misuse.
export * from './directives/crucible-dialog-content.directive';
export * from './directives/crucible-dialog-actions.directive';
export * from './directives/crucible-dialog-title.directive';
export * from './services/crucible-dialog.service';
export * from './models/crucible-confirm-options';

/**
 * Convenience barrel of the public standalone declarables. Spread into a
 * standalone component's (or NgModule's) `imports` to use `<crucible-dialog>`
 * and the `[crucibleDialogContent]` / `[crucibleDialogActions]` /
 * `[crucibleDialogTitle]` projection markers:
 *
 * ```ts
 * imports: [...CRUCIBLE_DIALOG_IMPORTS]
 * ```
 *
 * The Material/CDK modules a consumer needs INSIDE its own projected content
 * (e.g. `mat-dialog-close` on a custom footer button, `matIconButton`/`mat-icon`
 * in a custom title, or `cdkFocusInitial` on a field) compile in the consumer's
 * own template context, so the consumer imports those itself.
 */
export const CRUCIBLE_DIALOG_IMPORTS = [
  CrucibleDialogComponent,
  CrucibleDialogContentDirective,
  CrucibleDialogActionsDirective,
  CrucibleDialogTitleDirective,
] as const;
