// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  Component,
  ContentChild,
  input,
  Optional,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CrucibleDialogActionsDirective } from '../../directives/crucible-dialog-actions.directive';
import { CrucibleDialogTitleDirective } from '../../directives/crucible-dialog-title.directive';

/**
 * Presentational shell for Crucible form/content modals. Owns the
 * title → content → actions Material skeleton, the a11y wiring, and the
 * loading/error affordances. It does NOT open itself — the host calls
 * `MatDialog.open(MyDialogComponent, {...})` and `MyDialogComponent`'s template
 * uses `<crucible-dialog>` as its root.
 *
 * Appearance (font, button fill/shape, field styling, padding) comes entirely from
 * the consuming app's M3 theme tokens; this component asserts no appearance CSS.
 */
// 'crucible-' selector prefix is an intentional deviation from the lib's historical
// 'lib' tslint prefix: Angular 21 removed the tslint builder so ng lint no longer
// enforces it, and renaming would churn every Caster template.
@Component({
  selector: 'crucible-dialog',
  templateUrl: './crucible-dialog.component.html',
  styleUrls: ['./crucible-dialog.component.scss'],
  host: {
    '[attr.title]': 'null',
  },
  imports: [
    CommonModule,
    ReactiveFormsModule,
    A11yModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class CrucibleDialogComponent {
  /**
   * Dialog title rendered as <h2 mat-dialog-title>; provides the accessible name.
   * Optional only when a `[crucibleDialogTitle]` header is projected instead (e.g.
   * a title with an icon button). One of `dialogTitle` or a projected title must be set.
   */
  dialogTitle = input<string>('');
  /**
   * @deprecated Use `dialogTitle`. The `title` input name overlaps with the native
   * HTML title attribute and can create unwanted browser tooltips with static usage.
   */
  title = input<string>('');
  /** In-flight flag. Disables the primary, shows a spinner, swaps to loadingLabel, guards close. */
  loading = input(false, { transform: booleanAttribute });
  /** Server/validation error; rendered as role=alert inside content when non-empty. */
  errorMessage = input<string | null>(null);
  /** Title Case verb for the primary button. */
  submitLabel = input('Save');
  /** Label shown on the primary while loading. */
  loadingLabel = input('Saving…');
  /** Secondary (dismiss) button label. */
  cancelLabel = input('Cancel');
  /** App binds `!form.valid || !form.dirty`. Effective disabled = submitDisabled || loading. */
  submitDisabled = input(false, { transform: booleanAttribute });
  /**
   * Escalates the default backdrop guard to a full guard: while true, Escape is
   * suppressed too (not just backdrop click-outside), so neither accidental
   * dismissal can drop unsaved input. Cancel always remains as a deliberate way
   * out (§7). Loading does the same for the duration of an in-flight request.
   */
  guardUnsavedWork = input(false, { transform: booleanAttribute });
  /** Escape hatch: render only title+content + a custom [crucibleDialogActions] block. */
  hideDefaultActions = input(false, { transform: booleanAttribute });
  /** When bound, the wrapper renders the form branch wrapping content + actions. */
  form = input<FormGroup | undefined>(undefined);

  /** Emitted when the secondary (dismiss) button is clicked. */
  cancel = output<void>();
  /**
   * Emitted when the primary action is invoked, regardless of mode: in form mode
   * it fires from the projected form's (ngSubmit) (so Enter-to-submit works); in
   * no-form (content) mode it fires from the primary button click. Callers bind a
   * single (submit) and never need to know which mode they're in.
   */
  submit = output<void>();

  /** Auto-detected custom actions; presence suppresses the default Cancel/Submit pair. */
  @ContentChild(CrucibleDialogActionsDirective)
  projectedActions?: CrucibleDialogActionsDirective;

  /** Auto-detected custom title; presence renders the projected header instead of the `dialogTitle` string. */
  @ContentChild(CrucibleDialogTitleDirective)
  projectedTitle?: CrucibleDialogTitleDirective;

  constructor(@Optional() private dialogRef?: MatDialogRef<unknown>) {
    if (this.dialogRef) {
      // §7: backdrop (click-outside) dismissal is OFF by default for every dialog
      // built on this shell, so an accidental outside-click can't silently drop
      // in-progress work. disableClose:true suppresses BOTH backdrop click AND
      // Escape, so we re-enable Escape ourselves below — the deliberate keyboard
      // way out always stays. Baking this in here means call sites get it for free.
      this.dialogRef.disableClose = true;
      this.dialogRef
        .keydownEvents()
        .pipe(takeUntilDestroyed())
        .subscribe((event) => {
          // Escape closes UNLESS we're fully guarding unsaved work or an in-flight
          // request — those would lose data on dismissal, so only the explicit
          // Cancel/Close button gets the user out then (§7/§7b).
          if (
            event.key === 'Escape' &&
            !this.guardUnsavedWork() &&
            !this.loading()
          ) {
            this.dialogRef?.close();
          }
        });
    }
  }

  /** Effective disabled state of the primary button. */
  get primaryDisabled(): boolean {
    return this.submitDisabled() || this.loading();
  }

  /** Preferred dialog title, falling back to the deprecated native-name alias. */
  get resolvedTitle(): string {
    return this.dialogTitle() || this.title();
  }

  /** True when the default Cancel/Submit pair should render. */
  get showDefaultActions(): boolean {
    return !this.hideDefaultActions() && !this.projectedActions;
  }

  onFormSubmit(event: Event): void {
    // Form mode: the projected form's (ngSubmit) is the single submit signal.
    // The native DOM 'submit' event bubbles up to the host <crucible-dialog>,
    // where it would be caught by the consumer's (submit) binding IN ADDITION to
    // our EventEmitter below — a double-fire (the output name 'submit' collides
    // with the native event). Stop it bubbling so (submit) fires exactly once.
    event.stopPropagation();
    this.submit.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmitClick(): void {
    // In form mode the host's (ngSubmit) already fires via the type="submit"
    // button, so we must NOT also emit here (would double-fire). In no-form mode
    // there is no ngSubmit, so the click is the only signal — emit it.
    if (!this.form()) {
      this.submit.emit();
    }
  }
}
