<!--
Copyright 2021 Carnegie Mellon University. All Rights Reserved.
Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.
-->

# crucible-dialog

Shared, app-agnostic modal building blocks for Crucible Angular apps. One
structure (title → content → actions) and look across every app, inherited from
the consuming app's M3 Material theme — the components ship **almost no CSS of
their own**.

Import `CrucibleDialogModule` into the NgModule (or standalone component) that
declares your dialog.

## Picking a shape

| Your modal | Use |
|---|---|
| Yes/No or delete confirm (title + message + 2 buttons) | `CrucibleDialogService.confirm(...)` |
| Form (reactive `FormGroup`) with Save/Cancel | `<crucible-dialog [form]="form" (submit)="save()">` |
| Template-driven (`[(ngModel)]`) form | `<crucible-dialog>` no-form mode + `(submit)` |
| Content/info only, or custom footer | `<crucible-dialog [hideDefaultActions]="true">` + projected actions |

The component never opens itself: the host calls
`MatDialog.open(MyDialogComponent, …)` and `MyDialogComponent`'s template uses
`<crucible-dialog>` as its root.

## Confirm (data-driven)

```ts
this.crucibleDialog
  .confirm({ title: 'Delete Project?', message: 'Delete Demo Project?', confirmText: 'Delete' })
  .afterClosed()
  .subscribe((confirmed) => { if (confirmed) this.delete(); });
```

`afterClosed()` emits `true` (confirmed) or `false`/`undefined` (cancel/escape).
A confirm that needs an embedded control (e.g. a checkbox) or a non-boolean
result is really a **form modal** — use `<crucible-dialog>`, not `confirm()`.

## Reactive form modal

```html
<crucible-dialog
  title="Edit Directory"
  [form]="form"
  submitLabel="Save"
  [submitDisabled]="!form.valid || !form.dirty"
  [guardUnsavedWork]="true"
  (submit)="save()"
  (cancel)="cancel()">
  <!-- IMPORTANT: re-declare [formGroup] on the projected container. The wrapper
       hosts the <form>, but content is *projected*, so formControlName resolves
       its FormGroup in the DECLARING template's injection context — without this
       you get a runtime "Cannot read properties of null (reading 'addControl')". -->
  <div crucibleDialogContent [formGroup]="form">
    <mat-form-field><input matInput formControlName="name" cdkFocusInitial /></mat-form-field>
  </div>
</crucible-dialog>
```

The single `<form>` wraps content **and** actions, so Enter-to-submit and
`type="submit"` work for free.

## Template-driven / content-only / custom footer

Omit `[form]`. Use `[hideDefaultActions]="true"` with a projected
`[crucibleDialogActions]` footer (any number of buttons, including a destructive
action), or rely on the default Cancel/primary pair and listen to `(submit)`.
Note: no-form mode has no wrapping `<form>`, so there is **no native
Enter-to-submit** — convert to a reactive `FormGroup` + `[form]` if you need it.

```html
<crucible-dialog [hideDefaultActions]="true">
  <ng-container crucibleDialogContent>…</ng-container>
  <ng-container crucibleDialogActions>
    <button matButton="outlined" mat-dialog-close>Cancel</button>
    <button matButton="filled" (click)="apply()">Apply</button>
  </ng-container>
</crucible-dialog>
```

## Custom title (icon / markup)

`title` is a plain string. When the header needs markup (e.g. an inline icon
button), project `[crucibleDialogTitle]` instead — it renders inside the
`<h2 mat-dialog-title>`:

```html
<crucible-dialog>
  <div crucibleDialogTitle>
    Edit Organization
    <button matIconButton mat-dialog-close><mat-icon>close</mat-icon></button>
  </div>
  <ng-container crucibleDialogContent>…</ng-container>
</crucible-dialog>
```

Set **either** `title` or a projected `[crucibleDialogTitle]` (the latter wins).

## Dismissal behavior (baked in — §7)

Every `<crucible-dialog>` ships with **backdrop click-outside dismissal OFF** so an
accidental click can't silently discard in-progress work. **Escape stays enabled**
and closes the dialog, and the explicit Cancel/Close button is always present — so
there is always a deliberate way out. You get this for free; do **not** re-set
`disableClose` at the call site.

The default **Cancel button closes the dialog on its own** (via `[mat-dialog-close]`),
so a host that doesn't need to react to dismissal can omit `(cancel)` entirely and
still get a working button. Bind `(cancel)` only when you need to *do* something on
dismissal (reset the form, confirm discarding changes, logging); it fires alongside
the close. (A fully custom footer via `[crucibleDialogActions]` owns its own close
wiring — see above.)

Set `[guardUnsavedWork]="true"` to fully guard a dialog (forms with dirty state,
multi-step flows): this **also** suppresses Escape, leaving only the Cancel button.
A dialog is likewise fully guarded for the duration of an in-flight request
(`[loading]="true"`), so a save in progress can't be dismissed out from under it.

> Purely informational / read-only confirms keep both Escape **and** backdrop
> dismissal — those go through `CrucibleDialogService.confirm(...)`, which has
> nothing to lose, not `<crucible-dialog>`.

## Testing

This module ships unit specs alongside its source:

- `services/crucible-dialog.service.spec.ts` — the `confirm(...)` flow and
  `MatDialog` config.
- `components/crucible-dialog/crucible-dialog.component.spec.ts` — the wrapper
  component (inputs, `submit`/`cancel` outputs, dismissal behavior).
- `components/crucible-confirm-dialog/crucible-confirm-dialog.component.spec.ts`
  — the internal confirm component.

Run them with the library suite from the repo root:

```bash
ng test crucible-common
```

See the root README's **Unit testing** section for Karma/Jasmine setup,
headless Chrome configuration, and the `CHROME_BIN` env var.

## Out of scope (keep bespoke)

- **`TemplateRef`-opened dialogs** (`dialog.open(myTemplateRef)`): there's no
  component class to host `<crucible-dialog>` as root. Keep their own markup.
- **Wizard/stepper dialogs**: project the stepper into `[crucibleDialogContent]`
  if desired, but these are rare and may stay bespoke.
