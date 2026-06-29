// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

/**
 * Options for {@link CrucibleDialogService.confirm}. Pure, app-agnostic types.
 */
export interface CrucibleConfirmOptions {
  /** Dialog title; rendered as <h2 mat-dialog-title> and used as the accessible name. */
  title: string;
  /** Message body; rendered as a <p> inside mat-dialog-content. */
  message: string;
  /** Affirmative button label. Title Case verb. Default 'Yes'. */
  confirmText?: string;
  /** Dismiss button label. Title Case. Default 'No'. */
  cancelText?: string;
  /** Forwarded to MatDialog.open config. */
  width?: string;
  /** Forwarded to MatDialog.open config. Default '90vw'. */
  maxWidth?: string;
}
