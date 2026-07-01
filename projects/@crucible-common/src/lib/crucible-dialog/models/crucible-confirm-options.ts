// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

/**
 * Options for {@link CrucibleDialogService.confirm}. Pure, app-agnostic types.
 */
export interface CrucibleConfirmOptions {
  /** Dialog title; used as the accessible name. */
  title: string;
  /** Message body. */
  message: string;
  /**
   * Affirmative button label. Title Case verb. Default 'Yes'.
   * Pass an empty string to render a message dialog with no affirmative button
   * (e.g. an acknowledge-only "OK" info dialog that uses `cancelText` instead).
   */
  confirmText?: string;
  /**
   * Dismiss button label. Title Case. Default 'No'.
   * Pass an empty string to render a single-button (affirmative-only) dialog,
   * e.g. an informational "Cannot delete…" message with just an OK button.
   */
  cancelText?: string;
  /** Forwarded to MatDialog.open config. */
  width?: string;
  /** Forwarded to MatDialog.open config. Default '90vw'. */
  maxWidth?: string;
}
