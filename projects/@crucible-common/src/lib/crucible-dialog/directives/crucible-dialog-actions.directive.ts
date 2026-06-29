// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Directive } from '@angular/core';

/**
 * Projection marker for fully custom dialog actions. When present (auto-detected via
 * ContentChild, or with hideDefaultActions=true) the wrapper renders the projected
 * actions instead of the built-in Cancel/Submit pair.
 */
@Directive({
  selector: '[crucibleDialogActions]',
  standalone: false,
})
export class CrucibleDialogActionsDirective {}
