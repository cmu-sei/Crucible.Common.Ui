// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Directive } from '@angular/core';

/**
 * Optional projection marker for a custom dialog title/header (e.g. a title with
 * an icon or an inline action button). When present, the wrapper projects it
 * inside the <h2 mat-dialog-title> instead of rendering the plain `dialogTitle`
 * string. Most dialogs just set the `dialogTitle` input; use this only when the
 * title needs markup.
 */
@Directive({
  selector: '[crucibleDialogTitle]',
})
export class CrucibleDialogTitleDirective {}
